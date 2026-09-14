export const couple = {
  bride: "Sanjhana",
  groom: "Santhosh",
  tagline: "A love story told in seven chapters",
  heroImage: "",
};

export type WeddingEvent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Fallback hero used until a hero photo is chosen. */
  heroImage: string;
  /** Fallback gallery used until the Google Cloud folder has photos. */
  gallery: string[];
};

/** Folder (prefix) inside the Google Cloud bucket that holds this chapter's photos. */
export const eventFolder = (slug: string) => `${slug}/`;

export const events: WeddingEvent[] = [
  {
    slug: "proposal",
    title: "The Proposal",
    subtitle: "Chapter One",
    description:
      "The quiet evening that changed everything, sealed with a question and a whispered yes. Two families, one beginning, and a promise made beneath a sky full of light.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "mama-seer",
    title: "Mama Seer",
    subtitle: "Chapter Two",
    description:
      "A cherished tradition where the bride's maternal family arrives bearing gifts of silk, silver and sweetness. Generations of love carried in on trays, blessing the days ahead.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "haldi",
    title: "Haldi",
    subtitle: "Chapter Three",
    description:
      "Turmeric, laughter and marigold gold pressed onto willing cheeks. A morning of warmth where every touch is a wish for a radiant life together.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "sangeet",
    title: "Sangeet",
    subtitle: "Chapter Four",
    description:
      "The night the families danced until the floor gave way to joy. Rehearsed routines, unrehearsed hearts, and music that refused to end.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "viratham",
    title: "Viratham",
    subtitle: "Chapter Five",
    description:
      "A sacred day of vows and preparation, observed in stillness before the celebration swells. Ritual, discipline and devotion offered for a blessed union.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "nalangu-reception",
    title: "Nalangu & Reception",
    subtitle: "Chapter Six",
    description:
      "Playful games between two families, followed by an evening of glamour and grace. Sandalwood, silk and a room full of people who love them both.",
    heroImage: "",
    gallery: [],
  },
  {
    slug: "muhurtham",
    title: "Muhurtham",
    subtitle: "Chapter Seven",
    description:
      "At the most auspicious hour, the thaali is tied and two lives become one. The moment every chapter before it was quietly writing toward.",
    heroImage: "",
    gallery: [],
  },
];

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
