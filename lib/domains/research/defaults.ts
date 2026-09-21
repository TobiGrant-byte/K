import type { ResearchContent } from "@/lib/domains/research/types";
import { siteMediaImageKitUrl } from "@/lib/domains/media/site-media-migration";

/**
 * Canonical static fallbacks — existing public Research page copy.
 */
export const RESEARCH_FALLBACK: ResearchContent = {
  development: {
    title: "Ideas That Shape How",
    titleAccent: "We Move",
    image: null,
    imageEyebrow: "Guiding Minds",
    imageCaption: "Where ideas find a voice",
    areas: [
      {
        id: "area-crash-analytics",
        title: "Advanced Crash Analytics & Predictive Safety",
        description:
          "Investigating the complex interplay of human behavior, roadway geometry, and environmental factors that lead to crashes. Expertise lies in developing predictive safety models, identifying systemic improvements, and implementing state and federal data-driven countermeasures designed to drastically reduce traffic fatalities.",
      },
      {
        id: "area-connected-infra",
        title:
          "Connected Infrastructure & Intelligent Transportation Systems",
        description:
          "Harnessing the power of real-world connected vehicle (CV) data, cloud-based telematics, and AI-driven spatial simulations to optimize corridor performance, assess autonomous vehicle readiness, and build future-proof, resilient municipal highway networks.",
      },
      {
        id: "area-inclusive-design",
        title: "Inclusive Infrastructure Design",
        description:
          "Championing human-centric transit solutions that serve all populations. Expertise includes adapting spatial data workflows to identify and rectify infrastructure disparities in underserved communities, enhance pedestrian networks, and improve mobility in both domestic and international contexts.",
      },
    ],
  },
  action: {
    title: "Moments that carry the",
    titleAccent: "work forward",
    subtitle:
      "Moments where research shows up in practice, professional forums, and the national safety community.",
    items: [
      {
        id: "action-garver-joint",
        label: "Practice · Garver · SDITE/MOVITE",
        title: "Connecting at the joint meeting",
        description:
          "Representing Garver at the 2025 SDITE/MOVITE Joint Meeting in Memphis — bringing research-minded engineering into professional conversation.",
        href: "https://www.linkedin.com/posts/sunday-okafor_garvertransportation-roadsafety-activity-7316450495957467136-wm-Q",
        image: null,
        fallbackSrc: siteMediaImageKitUrl("garver-award-1.png"),
      },
      {
        id: "action-trb-2025",
        label: "Industry · TRB Annual Meeting",
        title: "Speaking at TRB 2025",
        description:
          "Sharing expertise at the Transportation Research Board Annual Meeting in Washington, DC — where research and practice meet on a national stage.",
        href: "https://www.linkedin.com/posts/sunday-okafor_garvertransportation-trbam-activity-7281060396864532480-mRZj",
        image: null,
        fallbackSrc: siteMediaImageKitUrl("asa-board.jpg"),
      },
      {
        id: "action-lifesavers-2023",
        label: "Conference · Seattle, WA",
        title: "LIFESAVERS 2023",
        description:
          "Selected as a Traffic Safety Scholar at the national conference on highway safety priorities — recognizing emerging researchers shaping safer roads.",
        href: "",
        image: null,
        fallbackSrc: siteMediaImageKitUrl("lifesavers-conf.webp"),
      },
    ],
  },
  updatedAt: "",
};

export const RESEARCH_IMAGE_FALLBACK_SRC = siteMediaImageKitUrl("lecture-hall.jpg");
export const RESEARCH_IMAGE_FALLBACK_ALT = "Dr. Okafor lecturing";
