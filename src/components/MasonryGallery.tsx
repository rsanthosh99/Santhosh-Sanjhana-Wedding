import { useEffect, useMemo, useRef, useState } from "react";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { useFavorites } from "@/hooks/useFavorites";

export type GalleryPhoto = { name: string; thumb: string; full: string };

const PAGE_SIZE = 60;

export function MasonryGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { isFavorite, toggleFavorite } = useFavorites();
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [photos]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, photos.length));
        }
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [photos.length]);

  const shown = useMemo(() => photos.slice(0, visible), [photos, visible]);
  const fullUrls = useMemo(() => photos.map((p) => p.full), [photos]);

  return (
    <>
      <div className="masonry-grid">
        {shown.map((photo, i) => (
          <PhotoCard
            key={photo.name}
            src={photo.thumb}
            fullSrc={photo.full}
            index={i}
            favorite={isFavorite(photo.full)}
            onToggleFavorite={toggleFavorite}
            onOpen={setOpenIndex}
          />
        ))}
      </div>

      {visible < photos.length && (
        <div ref={sentinel} className="py-14 text-center text-[11px] tracking-editorial text-muted-foreground">
          Loading more photographs…
        </div>
      )}

      <Lightbox
        images={fullUrls}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
}
