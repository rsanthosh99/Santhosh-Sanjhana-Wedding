import { createServerFn } from "@tanstack/react-start";
import { events, getEvent } from "@/data/weddingData";

export const getEventGallery = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
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
