import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MasonryGallery } from "./MasonryGallery";
import { events, type WeddingEvent } from "@/data/weddingData";
import { getEventGallery } from "@/lib/gallery.functions";

export function EventPage({ event }: { event: WeddingEvent }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const { data } = useQuery({
    queryKey: ["gallery", event.slug],
    queryFn: () => getEventGallery({ data: { slug: event.slug } }),
    staleTime: 60_000,
  });

  const photos = data?.photos ?? event.gallery.map((src) => ({ name: src, thumb: src, full: src }));
  const heroImage = data?.heroUrl ?? event.heroImage;

  const i = events.findIndex((e) => e.slug === event.slug);
  const prev = events[(i - 1 + events.length) % events.length]!;
  const next = events[(i + 1) % events.length]!;

  return (
    <div className="bg-background">
      <div ref={ref} className="relative h-screen">
        <motion.div
          style={{ opacity }}
          className="pointer-events-none fixed inset-0 h-screen w-full"
        >
          <motion.div style={{ scale }} className="absolute inset-0">
            <img src={heroImage} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/70" />
          </motion.div>

          <motion.div
            style={{ y: textY }}
            className="relative flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] tracking-editorial text-on-dark/70"
            >
              {event.subtitle}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] text-on-dark sm:text-7xl lg:text-8xl"
            >
              {event.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-xl text-sm leading-relaxed text-on-dark/80 sm:text-base"
            >
              {event.description}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-background px-6 pb-28 pt-20 lg:px-10"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 flex flex-col gap-3 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
              {event.title} Gallery
            </h2>
            <p className="text-[11px] tracking-editorial text-muted-foreground">
              {photos.length} photographs
            </p>
          </div>

          <MasonryGallery photos={photos} />

          <div className="mt-24 flex items-center justify-between border-t border-border pt-10">
            <Link
              to="/$slug"
              params={{ slug: prev.slug }}
              className="group flex items-center gap-3 text-left"
            >
              <ArrowLeft size={16} className="text-muted-foreground transition group-hover:-translate-x-1" />
              <span>
                <span className="block text-[10px] tracking-editorial text-muted-foreground">
                  Previous
                </span>
                <span className="font-serif text-lg text-foreground">{prev.title}</span>
              </span>
            </Link>
            <Link
              to="/$slug"
              params={{ slug: next.slug }}
              className="group flex items-center gap-3 text-right"
            >
              <span>
                <span className="block text-[10px] tracking-editorial text-muted-foreground">
                  Next
                </span>
                <span className="font-serif text-lg text-foreground">{next.title}</span>
              </span>
              <ArrowRight size={16} className="text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
