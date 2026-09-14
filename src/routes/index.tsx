import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { couple, events } from "@/data/weddingData";
import { getAllHeroes, getHomeHero } from "@/lib/gallery.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Santhosh & Sanjhana — A Wedding Story" },
      {
        name: "description",
        content:
          "The wedding story of Santhosh & Sanjhana in seven chapters — proposal, mama seer, haldi, sangeet, viratham, reception and muhurtham.",
      },
      { property: "og:title", content: "Santhosh & Sanjhana — A Wedding Story" },
      {
        property: "og:description",
        content: "Seven chapters of celebration, captured in an editorial photo gallery.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const spans = [
  "lg:col-span-7 lg:row-span-2 min-h-[280px] lg:min-h-[520px]",
  "lg:col-span-5 min-h-[240px]",
  "lg:col-span-5 min-h-[240px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-6 min-h-[320px]",
  "lg:col-span-6 min-h-[320px]",
];

function Home() {
  const { data: heroes } = useQuery({
    queryKey: ["heroes"],
    queryFn: () => getAllHeroes(),
    staleTime: 60_000,
  });

  const { data: homeHero } = useQuery({
    queryKey: ["homeHero"],
    queryFn: () => getHomeHero(),
    staleTime: 60_000,
  });
  const heroFor = (slug: string, fallback: string) =>
    heroes?.find((h) => h.slug === slug)?.heroUrl ?? fallback;

  return (
    <main className="bg-background">
      <section className="relative h-screen w-full overflow-hidden">

        {homeHero ? (
          <motion.img
            src={homeHero}
            alt={`${couple.groom} and ${couple.bride}`}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-ink" />
        )}
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/80" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[11px] tracking-editorial text-on-dark/75"
          >
            {couple.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-serif leading-[0.9] text-on-dark"
          >
            <span className="block text-6xl sm:text-8xl lg:text-[8.5rem]">{couple.groom}</span>
            <span className="my-2 block text-3xl italic text-accent sm:text-5xl">&</span>
            <span className="block text-6xl sm:text-8xl lg:text-[8.5rem]">{couple.bride}</span>
          </motion.h1>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-10 flex items-center gap-4"
          >
            <span className="h-px w-12 bg-on-dark/40" />
            <span className="text-[11px] tracking-editorial text-on-dark/70">
              Eight Chapters
            </span>
            <span className="h-px w-12 bg-on-dark/40" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-on-dark/60"
        >
          <ArrowDown size={18} strokeWidth={1.2} />
        </motion.div>
      </section>

      <section className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 flex flex-col gap-4 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between"
          >
            <h2 className="max-w-xl font-serif text-4xl leading-tight text-foreground sm:text-6xl">
              The Chapters
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Every ritual, every celebration and every quiet moment in between — gathered
              here as one continuous story.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {events.map((event, i) => (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={spans[i]}
              >
                <Link
                  to="/$slug"
                  params={{ slug: event.slug }}
                  className="group relative block h-full w-full overflow-hidden bg-secondary"
                >
                  <img
                    src={heroFor(event.slug, event.heroImage)}
                    alt={event.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-ink/40 transition-colors duration-700 group-hover:bg-ink/55" />
                  <div className="relative flex h-full flex-col justify-end p-7">
                    <p className="text-[10px] tracking-editorial text-on-dark/70">
                      {event.subtitle}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <h3 className="font-serif text-3xl text-on-dark sm:text-4xl">
                        {event.title}
                      </h3>
                      <ArrowUpRight
                        size={22}
                        strokeWidth={1.2}
                        className="mb-1 shrink-0 text-on-dark/70 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-16 text-center lg:px-10">
        <p className="font-serif text-3xl text-foreground">
          {couple.groom} <span className="italic text-accent">&</span> {couple.bride}
        </p>
        <p className="mt-4 text-[11px] tracking-editorial text-muted-foreground">
          With love, always
        </p>
      </footer>
    </main>
  );
}
