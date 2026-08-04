import { useCallback, useEffect, useState } from "react";

const KEY = "ss-wedding-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFavorite = useCallback((src: string) => {
    setFavorites((prev) => {
      const next = prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((src: string) => favorites.includes(src), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

export async function downloadImage(src: string, filename: string) {
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank", "noopener");
  }
}
