import { motion } from "motion/react";
import { Heart, Download } from "lucide-react";
import { downloadImage } from "@/hooks/useFavorites";

type Props = {
  src: string;
  fullSrc: string;
  index: number;
  favorite: boolean;
  onToggleFavorite: (src: string) => void;
  onOpen: (index: number) => void;
};

export function PhotoCard({ src, fullSrc, index, favorite, onToggleFavorite, onOpen }: Props) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="masonry-item group relative cursor-pointer overflow-hidden bg-secondary"
      onClick={() => onOpen(index)}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />

      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          aria-label="Favorite photo"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(fullSrc);
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur transition hover:bg-background"
        >
          <Heart size={15} className={favorite ? "fill-accent text-accent" : "text-foreground"} />
        </button>
        <button
          aria-label="Download photo"
          onClick={(e) => {
            e.stopPropagation();
            downloadImage(fullSrc, `santhosh-sanjhana-${index + 1}.jpg`);
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur transition hover:bg-background"
        >
          <Download size={15} className="text-foreground" />
        </button>
      </div>

      {favorite && (
        <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/85 opacity-100 backdrop-blur transition group-hover:opacity-0">
          <Heart size={13} className="fill-accent text-accent" />
        </span>
      )}
    </motion.figure>
  );
}
