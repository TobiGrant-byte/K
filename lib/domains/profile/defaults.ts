import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";
import type { ProfileContent } from "@/lib/domains/profile/types";

function config(
  positionX: number,
  positionY: number,
  zoom = 1,
): ImageDisplayConfig {
  return { positionX, positionY, zoom };
}

/**
 * Canonical static fallbacks — existing public site copy.
 * Used when Firestore is empty/unavailable and as migration seed.
 */
export const PROFILE_FALLBACK: ProfileContent = {
  home: {
    roles: ["Transportation\nEngineer.", "Researcher.", "Leader."],
    quote:
      "Do not let the difficult days deter you from moving forward, keep going everyday",
  },
  about: {
    title: "A Civil Engineer Dedicated to the Future of Safe,",
    titleAccent: "Smart Transportation Infrastructure.",
    excerpt:
      "Dr. Sunday Okafor is a licensed Professional Engineer operating at the critical nexus of traffic safety analytics, connected vehicle systems, and complex infrastructure delivery. His work is driven by a singular mission: to use data to make our roads safer, more efficient, and more equitable for everyone.",
    body: [
      "A distinguished scholar, Dr. Okafor earned his Master’s and Doctor of Philosophy (Ph.D.) in Civil Engineering from The University of Alabama, where his research as a Graduate Research Assistant at the Alabama Transportation Institute (ATI)—a premier national hub for transit innovation—focused on advanced crash analytics and predictive modeling. He was awarded his Master of Science (M.Sc.) in Civil Engineering from Nottingham Trent University, UK, as a prestigious Commonwealth Shared Scholar, a testament to his academic excellence and global potential. He holds a Bachelor of Science (B.Sc.) from FUNAAB, Nigeria.",
      "Dr. Okafor brings his academic rigor to the corporate sector as a Project Engineer at Garver, where he facilitates the planning and design of safe and efficient transportation systems across the United States. He has received multiple awards, including, Garver Transportation Peak Performer Award, ITE Young Leader to Follow, ITE Excellence in Highway Safety Research Award, and Lifesavers Conference Scholarship Award, for his contributions to the profession. Dr Okafor is also a dedicated community builder, having served as President of the African Students Association, Vice President ITE Student Chapter, Graduate School Ambassador, and International Peer Advisory Council Member at The University of Alabama.",
      "Dr. Okafor is happily married to Maryjane, and they are dedicated to building a strong relationship  that honors God and serve as role model to the younger generation.",
    ].join("\n\n"),
    image: null,
  },
  hobbies: {
    eyebrow: "Away From Work",
    title: "The Man Behind the",
    titleAccent: "PhD",
    subtitle:
      "Excellence in engineering begins with a life well-lived outside of it.",
    quote:
      "A great mind is nothing without a great heart — and a great partner to share life with.",
    items: [
      {
        id: "hobby-wife",
        title: "Talking with His Wife",
        description:
          "His favourite thing to do is engaging in daily gists with his Achalaugo, Maryjane — the conversations that ground every day.",
        icon: "♡",
        image: null,
        imageConfig: config(0.5, 0.22),
      },
      {
        id: "hobby-chess",
        title: "Playing Chess",
        description:
          "He also enjoys playing chess — a quiet contest of patience, foresight, and calm under pressure.",
        icon: "♟",
        image: null,
        imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
      },
      {
        id: "hobby-football",
        title: "Watching Football",
        description:
          "And when the whistle blows, you’ll find him watching football — the beautiful game, shared with the same easy joy.",
        icon: "◎",
        image: null,
        imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
      },
    ],
  },
  updatedAt: "",
};

/** Static About / Home teaser portrait when no Media Library image is selected. */
export const ABOUT_IMAGE_FALLBACK_SRC = "/images/headshot.jpg";
export const ABOUT_IMAGE_FALLBACK_ALT = "Dr. Sunday Okafor";

/** Static Home hero — never CMS-managed; stays on /public. */
export const HOME_HERO_IMAGE_SRC = "/images/hero-picture.jpeg";
