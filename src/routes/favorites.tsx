import { createFileRoute } from "@tanstack/react-router";
import { MasonryGallery } from "@/components/MasonryGallery";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites — Santhosh & Sanjhana" },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useFavorites();
  
  const photos = favorites.map(fullUrl => {
     const parts = fullUrl.split("/");
     const filename = parts.pop()!;
     const folder = parts.pop()!;
     const basePath = parts.join("/");
     return {
       name: `${folder}/${filename}`,
       full: fullUrl,
       thumb: `${basePath}/thumbs/${folder}/${filename}`,
     };
  });

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-20">
        <h1 className="mb-10 font-serif text-4xl text-foreground sm:text-5xl">My Favorites</h1>
        {photos.length > 0 ? (
          <MasonryGallery photos={photos} />
        ) : (
          <p className="text-muted-foreground font-serif italic text-lg">You haven't favorited any photos yet. Tap the heart icon on any photo to save it here!</p>
        )}
      </div>
    </main>
  );
}
