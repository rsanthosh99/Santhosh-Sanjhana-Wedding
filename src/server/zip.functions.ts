import { createServerFn } from "@tanstack/react-start";
import { getEvent } from "@/data/weddingData";
import archiver from "archiver";

export const downloadChapterZip = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const event = getEvent(data.slug);
    if (!event) throw new Error("Chapter not found");

    const { buildEventGallery } = await import("@/lib/gallery.server");
    const gallery = await buildEventGallery(event.slug, {
      heroImage: event.heroImage,
      gallery: event.gallery,
    });

    const readable = new ReadableStream({
      start(controller) {
        const archive = archiver("zip", { zlib: { level: 0 } }); // Store only for speed since JPEGs are already compressed

        archive.on("data", (chunk) => controller.enqueue(chunk));
        archive.on("end", () => controller.close());
        archive.on("error", (err) => controller.error(err));

        // Fetch each image as a stream and append to archive
        // To prevent memory overload and connection limits, we do it in chunks or sequentially
        (async () => {
          try {
            for (let i = 0; i < gallery.photos.length; i++) {
              const photo = gallery.photos[i];
              const response = await fetch(photo.full);
              if (response.ok && response.body) {
                // Convert Web Stream to Node Stream for archiver
                // We can just use arrayBuffer
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const filename = photo.name.split("/").pop() || `photo-${i}.jpg`;
                archive.append(buffer, { name: filename });
              }
            }
            archive.finalize();
          } catch (error) {
            archive.emit("error", error);
          }
        })();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="santhosh-sanjhana-${event.slug}.zip"`,
      },
    });
  });
