import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { events } from "@/data/weddingData";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
        <Link
          to="/"
          className={`font-serif text-lg tracking-[0.2em] transition-colors duration-500 ${
            solid ? "text-foreground" : "text-on-dark"
          }`}
        >
          S <span className="text-accent">&</span> S
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {events.map((e) => (
            <li key={e.slug}>
              <Link
                to="/$slug"
                params={{ slug: e.slug }}
                className={`text-[11px] tracking-editorial transition-colors duration-300 hover:text-accent ${
                  solid ? "text-muted-foreground" : "text-on-dark/85"
                }`}
                activeProps={{ className: "text-accent" }}
              >
                {e.title}
              </Link>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className={`lg:hidden transition-colors duration-500 ${
            solid ? "text-foreground" : "text-on-dark"
          }`}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/60 bg-background/95 px-6 lg:hidden"
          >
            {events.map((e) => (
              <li key={e.slug} className="border-b border-border/40 last:border-0">
                <Link
                  to="/$slug"
                  params={{ slug: e.slug }}
                  className="block py-4 font-serif text-lg text-foreground"
                >
                  {e.title}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
