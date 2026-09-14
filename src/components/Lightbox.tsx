import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Heart, Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { downloadImage } from "@/hooks/useFavorites";

type Props = {
  images: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
  isFavorite: (src: string) => boolean;
  onToggleFavorite: (src: string) => void;
};

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showHeart, setShowHeart] = useState(false);


  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNavigate]);

  const src = index !== null ? images[index] : null;
  const nextSrc = index !== null ? images[(index + 1) % images.length] : null;
  const prevSrc = index !== null ? images[(index - 1 + images.length) % images.length] : null;

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 sm:p-10"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-50 p-3 text-on-dark/70 transition hover:text-on-dark sm:right-5 sm:top-5"
          >
            <X size={26} />
          </button>

          <button
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! - 1 + images.length) % images.length);
            }}
            className="absolute left-3 z-10 text-on-dark/60 transition hover:text-on-dark sm:left-8"
          >
            <ChevronLeft size={38} strokeWidth={1} />
          </button>
          <button
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! + 1) % images.length);
            }}
            className="absolute right-3 z-10 text-on-dark/60 transition hover:text-on-dark sm:right-8"
          >
            <ChevronRight size={38} strokeWidth={1} />
          </button>

          <motion.div
            key={src}
            drag={isZoomed ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, { offset, velocity }) => {
              if (Math.abs(offset.y) > 80 || Math.abs(velocity.y) > 400) {
                onClose();
              }
            }}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`flex max-h-full flex-col items-center gap-4 ${!isZoomed ? "cursor-grab active:cursor-grabbing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              onTransformed={(ref) => setIsZoomed(ref.state.scale > 1.01)}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: true }}
            >
              <TransformComponent wrapperClass="!max-h-[78vh] flex items-center justify-center">
                <div 
                  className="relative flex items-center justify-center"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isFavorite(src)) onToggleFavorite(src);
                    setShowHeart(true);
                    setTimeout(() => setShowHeart(false), 800);
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="max-h-[78vh] w-auto max-w-full object-contain shadow-2xl"
                    style={{ pointerEvents: "auto" }}
                    draggable={false}
                  />
                  <AnimatePresence>
                    {showHeart && (
                      <motion.div
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute z-50 pointer-events-none"
                      >
                        <Heart size={100} strokeWidth={0} className="fill-white/80 drop-shadow-2xl" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TransformComponent>
            </TransformWrapper>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleFavorite(src)}
                aria-label="Favorite"
                className="flex items-center gap-2 border border-on-dark/25 px-4 py-2 text-[11px] tracking-editorial text-on-dark/80 transition hover:border-on-dark/60"
              >
                <Heart
                  size={15}
                  className={isFavorite(src) ? "fill-accent text-accent" : ""}
                />
                {isFavorite(src) ? "Favorited" : "Favorite"}
              </button>
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("photo", index!.toString());
                  navigator.clipboard.writeText(url.toString());
                  // Optional: we could add a toast here
                }}
                aria-label="Share"
                className="flex items-center gap-2 border border-on-dark/25 px-4 py-2 text-[11px] tracking-editorial text-on-dark/80 transition hover:border-on-dark/60"
              >
                <Share size={15} /> Share
              </button>
              <button
                onClick={() => downloadImage(src, `santhosh-sanjhana-${index}.jpg`)}
                aria-label="Download"
                className="flex items-center gap-2 border border-on-dark/25 px-4 py-2 text-[11px] tracking-editorial text-on-dark/80 transition hover:border-on-dark/60"
              >
                <Download size={15} /> Download
              </button>
            </div>
            <p className="text-[11px] tracking-editorial text-on-dark/40">
              {index! + 1} / {images.length}
            </p>
            {/* Preload adjacent images */}
            {nextSrc && <link rel="preload" as="image" href={nextSrc} />}
            {prevSrc && <link rel="preload" as="image" href={prevSrc} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
