import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, EyeOff, RefreshCw, Star } from "lucide-react";
type Photo = { name: string; thumb: string; full: string };
import {
  getAdminGallery,
  rescanBucket,
  setEventHero,
  setPhotoHidden,
} from "@/lib/gallery.functions";
import { events } from "@/data/weddingData";

export function AdminHeroPicker() {
  const [slug, setSlug] = useState(events[0]!.slug);
  const qc = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["admin-gallery", slug],
    queryFn: () => getAdminGallery({ data: { slug } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-gallery", slug] });
    qc.invalidateQueries({ queryKey: ["heroes"] });
    qc.invalidateQueries({ queryKey: ["gallery", slug] });
  };

  const heroMutation = useMutation({
    mutationFn: (objectName: string | null) => setEventHero({ data: { slug, objectName } }),
    onSuccess: invalidate,
  });
  const hideMutation = useMutation({
    mutationFn: (v: { objectName: string; hidden: boolean }) =>
      setPhotoHidden({ data: { slug, ...v } }),
    onSuccess: invalidate,
  });
  const rescanMutation = useMutation({
    mutationFn: () => rescanBucket({ data: { slug } }),
    onSuccess: invalidate,
  });

  const photos: Photo[] = useMemo(() => data?.gallery.photos ?? [], [data]);
  const heroObject = data?.settings?.hero_object ?? null;
  const hidden = data?.settings?.hidden ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-6">
        {events.map((e) => (
          <button
            key={e.slug}
            onClick={() => setSlug(e.slug)}
            className={`border px-4 py-2 text-[11px] tracking-editorial transition ${
              slug === e.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {e.title}
          </button>
        ))}
        <button
          onClick={() => rescanMutation.mutate()}
          className="ml-auto flex items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-editorial text-muted-foreground transition hover:border-foreground"
        >
          <RefreshCw size={13} className={rescanMutation.isPending ? "animate-spin" : ""} />
          Rescan folder
        </button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {data?.gallery.bucketConfigured === false
          ? "No Google Cloud bucket connected yet — showing placeholder photos."
          : `${photos.length} photos in folder “${slug}/”${hidden.length ? ` · ${hidden.length} hidden` : ""}`}
        {isFetching ? " · refreshing…" : ""}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((p) => {
          const isHero = heroObject === p.name;
          return (
            <figure key={p.name} className="group relative overflow-hidden bg-secondary">
              <img src={p.thumb} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
              {isHero && (
                <span className="absolute left-2 top-2 flex items-center gap-1 bg-background/90 px-2 py-1 text-[10px] tracking-editorial">
                  <Check size={11} /> Hero
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => heroMutation.mutate(isHero ? null : p.name)}
                  className="flex flex-1 items-center justify-center gap-1 bg-background/90 py-2 text-[10px] tracking-editorial hover:bg-background"
                >
                  <Star size={12} /> {isHero ? "Unset" : "Set hero"}
                </button>
                <button
                  onClick={() => hideMutation.mutate({ objectName: p.name, hidden: true })}
                  aria-label="Hide photo"
                  className="grid w-9 place-items-center bg-background/90 hover:bg-background"
                >
                  <EyeOff size={12} />
                </button>
              </div>
            </figure>
          );
        })}
      </div>

      {hidden.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="font-serif text-xl text-foreground">Hidden photos</h3>
          <ul className="mt-4 space-y-2">
            {hidden.map((name) => (
              <li key={name} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-muted-foreground">{name}</span>
                <button
                  onClick={() => hideMutation.mutate({ objectName: name, hidden: false })}
                  className="flex shrink-0 items-center gap-1 border border-border px-3 py-1 text-[10px] tracking-editorial hover:border-foreground"
                >
                  <Eye size={12} /> Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Keeps the picker from rendering during SSR where auth state is unknown. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
