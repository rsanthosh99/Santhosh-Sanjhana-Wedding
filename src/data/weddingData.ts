import heroCouple from "@/assets/hero-couple.jpg";
import proposal1 from "@/assets/proposal-1.jpg";
import mamaseer1 from "@/assets/mamaseer-1.jpg";
import haldi1 from "@/assets/haldi-1.jpg";
import sangeet1 from "@/assets/sangeet-1.jpg";
import viratham1 from "@/assets/viratham-1.jpg";
import reception1 from "@/assets/reception-1.jpg";
import muhurtham1 from "@/assets/muhurtham-1.jpg";
import detail1 from "@/assets/detail-1.jpg";
import detail2 from "@/assets/detail-2.jpg";
import detail3 from "@/assets/detail-3.jpg";
import detail4 from "@/assets/detail-4.jpg";
import detail5 from "@/assets/detail-5.jpg";
import detail6 from "@/assets/detail-6.jpg";
import detail7 from "@/assets/detail-7.jpg";
import detail8 from "@/assets/detail-8.jpg";

export const couple = {
  bride: "Sanjhana",
  groom: "Santhosh",
  tagline: "A love story told in seven chapters",
  heroImage: heroCouple,
};

export type WeddingEvent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Fallback hero used until a hero photo is chosen in /admin. */
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
    heroImage: proposal1,
    gallery: [proposal1, detail6, heroCouple, detail2, detail1, detail8, detail3, detail4],
  },
  {
    slug: "mama-seer",
    title: "Mama Seer",
    subtitle: "Chapter Two",
    description:
      "A cherished tradition where the bride's maternal family arrives bearing gifts of silk, silver and sweetness. Generations of love carried in on trays, blessing the days ahead.",
    heroImage: mamaseer1,
    gallery: [mamaseer1, detail4, detail3, detail1, detail5, detail7, detail2, heroCouple],
  },
  {
    slug: "haldi",
    title: "Haldi",
    subtitle: "Chapter Three",
    description:
      "Turmeric, laughter and marigold gold pressed onto willing cheeks. A morning of warmth where every touch is a wish for a radiant life together.",
    heroImage: haldi1,
    gallery: [haldi1, detail1, detail4, detail3, detail6, detail2, detail5, detail8],
  },
  {
    slug: "sangeet",
    title: "Sangeet",
    subtitle: "Chapter Four",
    description:
      "The night the families danced until the floor gave way to joy. Rehearsed routines, unrehearsed hearts, and music that refused to end.",
    heroImage: sangeet1,
    gallery: [sangeet1, detail4, detail6, detail7, detail2, detail8, detail3, reception1],
  },
  {
    slug: "viratham",
    title: "Viratham",
    subtitle: "Chapter Five",
    description:
      "A sacred day of vows and preparation, observed in stillness before the celebration swells. Ritual, discipline and devotion offered for a blessed union.",
    heroImage: viratham1,
    gallery: [viratham1, detail8, detail3, detail7, detail1, muhurtham1, detail4, detail2],
  },
  {
    slug: "nalangu-reception",
    title: "Nalangu & Reception",
    subtitle: "Chapter Six",
    description:
      "Playful games between two families, followed by an evening of glamour and grace. Sandalwood, silk and a room full of people who love them both.",
    heroImage: reception1,
    gallery: [reception1, detail5, detail6, detail2, detail8, detail4, detail3, heroCouple],
  },
  {
    slug: "muhurtham",
    title: "Muhurtham",
    subtitle: "Chapter Seven",
    description:
      "At the most auspicious hour, the thaali is tied and two lives become one. The moment every chapter before it was quietly writing toward.",
    heroImage: muhurtham1,
    gallery: [muhurtham1, detail7, detail2, detail1, detail3, detail8, detail6, heroCouple],
  },
];

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
