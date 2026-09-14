import { getBucket, isImage, listPrefix, publicUrl } from "./gcs.server";
import { eventFolder } from "../data/weddingData";

export type Photo = { name: string; thumb: string; full: string };

export type EventGallery = {
  slug: string;
  photos: Photo[];
  heroUrl: string | null;
  source: "bucket" | "fallback";
  bucketConfigured: boolean;
  error?: string;
};

const CACHE_MS = 60_000;
const cache = new Map<string, { at: number; value: { photos: Photo[]; names: string[] } }>();

export function clearGalleryCache(slug?: string) {
  if (slug) cache.delete(slug);
  else cache.clear();
}

async function listEventObjects(slug: string) {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const bucket = getBucket()!;
  const folder = eventFolder(slug);
  const [originals, thumbs] = await Promise.all([
    listPrefix(bucket, folder),
    listPrefix(bucket, `thumbs/${folder}`).catch(() => [] as string[]),
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
    const { photos } = await listEventObjects(slug);

    // Look for a photo with 'hero' in the filename
    const heroIndex = photos.findIndex(p => p.name.toLowerCase().includes('hero'));
    
    let heroUrl = fallback.heroImage;
    let galleryPhotos = photos;
    
    if (heroIndex !== -1) {
      heroUrl = photos[heroIndex].full;
      // Remove the hero image from the main gallery array so it's not duplicated
      galleryPhotos = photos.filter((_, index) => index !== heroIndex);
    } else if (photos.length > 0) {
      // Fallback to the first image if no 'hero' file exists
      heroUrl = photos[0].full;
    }

    if (photos.length === 0) {
      return {
        slug,
        photos: fallback.gallery.map((src) => ({ name: src, thumb: src, full: src })),
        heroUrl: fallback.heroImage,
        source: "fallback",
        bucketConfigured: true,
      };
    }

    return { slug, photos: galleryPhotos, heroUrl, source: "bucket", bucketConfigured: true };
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
