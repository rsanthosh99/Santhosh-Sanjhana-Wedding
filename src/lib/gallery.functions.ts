import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { events, getEvent } from "@/data/weddingData";

export const getEventGallery = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { buildEventGallery } = await import("./gallery.server");
    const event = getEvent(data.slug);
    if (!event) throw new Error("Unknown chapter");
    return buildEventGallery(event.slug, {
      heroImage: event.heroImage,
      gallery: event.gallery,
    });
  });

export const getAllHeroes = createServerFn({ method: "GET" }).handler(async () => {
  const { buildEventGallery } = await import("./gallery.server");
  const results = await Promise.all(
    events.map((e) =>
      buildEventGallery(e.slug, { heroImage: e.heroImage, gallery: e.gallery }).then((g) => ({
        slug: e.slug,
        heroUrl: g.heroUrl ?? e.heroImage,
        count: g.source === "bucket" ? g.photos.length : 0,
      })),
    ),
  );
  return results;
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const setEventHero = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string; objectName: string | null }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("event_settings")
      .upsert({ slug: data.slug, hero_object: data.objectName, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    const { clearGalleryCache } = await import("./gallery.server");
    clearGalleryCache(data.slug);
    return { ok: true };
  });

export const setPhotoHidden = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string; objectName: string; hidden: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await context.supabase
      .from("event_settings")
      .select("hidden")
      .eq("slug", data.slug)
      .maybeSingle();
    const current: string[] = row?.hidden ?? [];
    const next = data.hidden
      ? Array.from(new Set([...current, data.objectName]))
      : current.filter((n) => n !== data.objectName);
    const { error } = await context.supabase
      .from("event_settings")
      .upsert({ slug: data.slug, hidden: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    const { clearGalleryCache } = await import("./gallery.server");
    clearGalleryCache(data.slug);
    return { hidden: next };
  });

export const rescanBucket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug?: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { clearGalleryCache } = await import("./gallery.server");
    clearGalleryCache(data.slug);
    return { ok: true };
  });

/** Admin-only: full listing including hidden photos, for the picker UI. */
export const getAdminGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { buildEventGallery, getSettings } = await import("./gallery.server");
    const event = getEvent(data.slug);
    if (!event) throw new Error("Unknown chapter");
    const [gallery, settings] = await Promise.all([
      buildEventGallery(event.slug, { heroImage: event.heroImage, gallery: event.gallery }),
      getSettings(event.slug),
    ]);
    return { gallery, settings };
  });
