export const couple = {
  bride: "Sanjhana",
  groom: "Santhosh",
  tagline: "Eight beautiful celebrations of forever",
  heroImage: "",
};

export type WeddingEvent = {
  slug: string;
  folder: string;
  title: string;
  subtitle: string;
  description: string;
  /** Fallback hero used until a hero photo is chosen. */
  heroImage: string;
  /** Fallback gallery used until the Google Cloud folder has photos. */
  gallery: string[];
};

export const events: WeddingEvent[] = [
  {
    slug: "proposal",
    folder: "Proposal",
    title: "The Proposal",
    subtitle: "Chapter One",
    description:
      "The quiet evening that changed everything, sealed with a question and a whispered yes. Two families, one beginning, and a promise made beneath a sky full of light.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "mama-seer",
    folder: "Mama Seer",
    title: "Mama Seer",
    subtitle: "Chapter Two",
    description:
      "A cherished tradition where the bride's maternal family arrives bearing gifts of silk, silver and sweetness. Generations of love carried in on trays, blessing the days ahead.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "haldi",
    folder: "Haldi",
    title: "Haldi",
    subtitle: "Chapter Three",
    description:
      "Turmeric, laughter and marigold gold pressed onto willing cheeks. A morning of warmth where every touch is a wish for a radiant life together.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "sangeeth",
    folder: "Sangeeth",
    title: "Sangeeth",
    subtitle: "Chapter Four",
    description:
      "The night the families danced until the floor gave way to joy. Rehearsed routines, unrehearsed hearts, and music that refused to end.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "wedding",
    folder: "Wedding",
    title: "Wedding",
    subtitle: "Chapter Five",
    description:
      "At the most auspicious hour, the thaali is tied and two lives become one. The moment every chapter before it was quietly writing toward.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "reception",
    folder: "Reception",
    title: "Reception",
    subtitle: "Chapter Six",
    description:
      "An evening of glamour, grace, and celebrating love. A room full of people who love them both.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "film-camera",
    folder: "Film Camera",
    title: "Film Camera",
    subtitle: "Chapter Seven",
    description:
      "Raw, unedited moments captured on film. Authentic memories frozen in time.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "film-stimulation",
    folder: "Film Stimulation",
    title: "Film Stimulation",
    subtitle: "Chapter Eight",
    description:
      "A cinematic look at the beautiful moments from our journey together.",
    heroImage: "",
    gallery: [],
  },
];

/** Folder (prefix) inside the Google Cloud bucket that holds this chapter's photos. */
export const eventFolder = (slug: string) => {
  if (slug === "home") return "Home/";
  const event = events.find((e) => e.slug === slug);
  return event ? `${event.folder}/` : `${slug}/`;
};

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
