import { createFileRoute, notFound } from "@tanstack/react-router";
import { EventPage } from "@/components/EventPage";
import { getEvent } from "@/data/weddingData";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const event = getEvent(params.slug);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const { event } = loaderData;
    const title = `${event.title} — Santhosh & Sanjhana`;
    return {
      meta: [
        { title },
        { name: "description", content: event.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: event.description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { property: "og:image", content: event.heroImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: event.heroImage },
      ],
    };
  },
  component: EventRoute,
});

function EventRoute() {
  const { event } = Route.useLoaderData();
  return <EventPage event={event} />;
}
