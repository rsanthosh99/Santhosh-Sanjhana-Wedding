// Server-only gallery assembly: bucket listing + admin settings.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getBucket, isImage, listPrefix, publicUrl } from "./gcs.server";

export type Photo = { name: string; thumb: string; full: string };

export type EventGallery = {
  slug: string;
  photos: Photo[];
  heroUrl: string | null;
  source: "bucket" | "fallback";
  bucketConfigured: boolean;
  error?: string;
};

type Settings = {
  slug: string;
  hero_object: string | null;
  pinned: string[];
  hidden: string[];
};

const CACHE_MS = 60_000;
const cache = new Map<string, { at: number; value: { photos: Photo[]; names: string[] } }>();

export function clearGalleryCache(slug?: string) {
  if (slug) cache.delete(slug);
  else cache.clear();
}

function publicSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function getSettings(slug: string): Promise<Settings | null> {
  const { data } = await publicSupabase()
    .from("event_settings")
    .select("slug, hero_object, pinned, hidden")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Settings) ?? null;
}

async function listEventObjects(slug: string) {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const bucket = getBucket()!;
  const [originals, thumbs] = await Promise.all([
    listPrefix(bucket, `${slug}/`),
    listPrefix(bucket, `thumbs/${slug}/`).catch(() => [] as string[]),
  ]);

  const thumbSet = new Set(thumbs);
  const names = originals.filter(isImage).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const photos: Photo[] = names.map((name) => {
    const thumbName = `thumbs/${name}`;
    return {
      name,
      full: publicUrl(bucket, name),
      thumb: publicUrl(bucket, thumbSet.has(thumbName) ? thumbName : name),
    };
  });

  const value = { photos, names };
  cache.set(slug, { at: Date.now(), value });
  return value;
}

export async function buildEventGallery(
  slug: string,
  fallback: { heroImage: string; gallery: string[] },
): Promise<EventGallery> {
  const bucket = getBucket();
  if (!bucket) {
    return {
      slug,
      photos: fallback.gallery.map((src) => ({ name: src, thumb: src, full: src })),
      heroUrl: fallback.heroImage,
      source: "fallback",
      bucketConfigured: false,
    };
  }

  try {
    const [{ photos }, settings] = await Promise.all([listEventObjects(slug), getSettings(slug)]);

    const hidden = new Set(settings?.hidden ?? []);
    const pinned = settings?.pinned ?? [];
    const visible = photos.filter((p) => !hidden.has(p.name));
    const pinnedFirst = [
      ...pinned.map((n) => visible.find((p) => p.name === n)).filter((p): p is Photo => !!p),
      ...visible.filter((p) => !pinned.includes(p.name)),
    ];

    const heroObject = settings?.hero_object;
    const heroUrl = heroObject
      ? publicUrl(bucket, heroObject)
      : (pinnedFirst[0]?.full ?? fallback.heroImage);

    if (pinnedFirst.length === 0) {
      return {
        slug,
        photos: fallback.gallery.map((src) => ({ name: src, thumb: src, full: src })),
        heroUrl: heroUrl ?? fallback.heroImage,
        source: "fallback",
        bucketConfigured: true,
      };
    }

    return { slug, photos: pinnedFirst, heroUrl, source: "bucket", bucketConfigured: true };
  } catch (error) {
    console.error(`[gallery] ${slug} failed:`, error);
    return {
      slug,
      photos: fallback.gallery.map((src) => ({ name: src, thumb: src, full: src })),
      heroUrl: fallback.heroImage,
      source: "fallback",
      bucketConfigured: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
