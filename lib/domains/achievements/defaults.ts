import {
  createMediaImageRef,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";
import type { AchievementsContent } from "@/lib/domains/achievements/types";

function config(
  positionX: number,
  positionY: number,
  zoom = 1,
): ImageDisplayConfig {
  return { positionX, positionY, zoom };
}

function img(
  galleryImageId: string,
  positionX: number,
  positionY: number,
  zoom = 1,
) {
  return createMediaImageRef(galleryImageId, config(positionX, positionY, zoom));
}

/** Admin seed only — written once into Firebase via ensureAchievementsContentSeeded. */
export const ACHIEVEMENTS_SEED: AchievementsContent = {
  milestones: {
    eyebrow: "Achievements & Milestones",
    title: "A Career Defined by",
    titleAccent: "Excellence",
    items: [
      {
        id: "achieve-garver-peak",
        year: "2025",
        title: "Garver Peak Performer Award",
        org: "Garver, USA",
        description:
          "Recognized with the Transportation Peak Performer Award at the Garver 2025 Summit in Houston — honoring exceptional performance and potential among professionals in their first two years of practice.",
        href: "https://www.linkedin.com/posts/sunday-okafor_i-was-recognized-with-the-transportation-activity-7388638154087510016-vvWI",
        fit: "cover",
        image: img("legacy-garver-award-1.png", 0.5, 0.3),
        imageConfig: config(0.5, 0.3),
        extraLinks: [],
      },
      {
        id: "achieve-pmp",
        year: "2024",
        title: "Project Management Professional (PMP)®",
        org: "Project Management Institute (PMI)",
        description:
          "Certified as a Project Management Professional (PMP)® by the Project Management Institute — earning Above Target performance across People, Process, and Business Environment. The preparation strengthened day-to-day project leadership, stakeholder engagement, and a lasting commitment to continuous professional growth.",
        href: "https://www.linkedin.com/posts/sunday-okafor_pmp-projectmanagement-pmi-ugcPost-7499966985686904832-ITqh",
        fit: "contain",
        image: img("legacy-img6.jpg", 0.5, 0.5),
        imageConfig: config(0.5, 0.5),
        extraLinks: [],
      },
      {
        id: "achieve-pe",
        year: "2024",
        title: "Licensed Professional Engineer (PE)",
        org: "Texas Board of Professional Engineers and Land Surveyors",
        description:
          "Obtained licensure as a Professional Engineer in Texas — a rigorous credential affirming readiness to practice and contribute to safer transportation systems for all road users.",
        href: "https://www.linkedin.com/posts/sunday-okafor_i-have-obtained-my-license-as-a-professional-activity-7465794480223318017-_w9Z",
        fit: "cover",
        image: img("legacy-credentials.png", 0.5, 0.42, 1.15),
        imageConfig: config(0.5, 0.42, 1.15),
        extraLinks: [],
      },
      {
        id: "achieve-phd",
        year: "2024",
        title: "Doctor of Philosophy",
        org: "The University of Alabama",
        description:
          "Conferred PhD in Civil Engineering, specializing in Transportation Systems Engineering from the Department of Civil, Construction and Environmental Engineering with dissertation research on the integration of connected vehicle data for proactive road safety improvement.",
        href: "https://www.linkedin.com/posts/sunday-okafor_its-official-dr-sunday-chizoba-okafor-activity-7227998699619045376-s8NH",
        fit: "cover",
        image: img("legacy-graduation-denny.webp", 0.5, 0.38, 1.25),
        imageConfig: config(0.5, 0.38, 1.25),
        extraLinks: [
          {
            id: "link-ua-grad",
            label: "UA graduation celebration",
            href: "https://www.linkedin.com/posts/sunday-okafor_rolltide-activity-7240202451956506624-bZ-Z",
          },
        ],
      },
      {
        id: "achieve-grad-support",
        year: "2021–2024",
        title: "Graduate Research Support",
        org: "Alabama Transportation Institute, The University of Alabama",
        description:
          "Funded graduate research across transportation operations, policy, and mobility centers — advancing crash analytics, inclusive mobility, and data-driven safety practice.",
        href: "",
        fit: "cover",
        image: img("legacy-lecture-hall.jpg", 0.5, 0.35),
        imageConfig: config(0.5, 0.35),
        extraLinks: [],
      },
      {
        id: "achieve-lifesavers",
        year: "2023",
        title: "LIFESAVERS Traffic Safety Scholar",
        org: "LIFESAVERS National Conference — Seattle, WA",
        description:
          "Selected as a Traffic Safety Scholar at the prestigious LIFESAVERS 2023 National Conference on Highway Safety Priorities in Seattle, Washington — recognizing emerging researchers in road safety.",
        href: "",
        fit: "cover",
        image: img("legacy-lifesavers-conf.webp", 0.5, 0.28),
        imageConfig: config(0.5, 0.28),
        extraLinks: [],
      },
      {
        id: "achieve-asa",
        year: "2023",
        title: "African Students Association President",
        org: "The University of Alabama",
        description:
          "Elected President of the African Students Association at UA, leading initiatives that promoted African culture, supported international students, and strengthened community bonds.",
        href: "https://www.linkedin.com/posts/sunday-okafor_i-am-delighted-to-announce-my-election-as-activity-6923901748248002560-AvzO",
        fit: "cover",
        image: img("legacy-asa-board.jpg", 0.5, 0.25),
        imageConfig: config(0.5, 0.25),
        extraLinks: [],
      },
      {
        id: "achieve-hsis",
        year: "2022",
        title: "HSIS Excellence in Safety Data Award",
        org: "ITE International Annual Meeting — New Orleans, USA",
        description:
          "Awarded the 2022 HSIS Excellence in Safety Data Award at the ITE International Annual Meeting and Exhibition in New Orleans — recognizing outstanding contributions in highway safety information systems and data-driven safety practice.",
        href: "https://www.linkedin.com/posts/sunday-okafor_itenola2022-rolltide-activity-6960599624537575424-KIzi",
        fit: "cover",
        image: img("legacy-hsis.jpg", 0.5, 0.3),
        imageConfig: config(0.5, 0.3),
        extraLinks: [],
      },
      {
        id: "achieve-msc",
        year: "2019",
        title: "MSc Civil Engineering with Distinction",
        org: "Nottingham Trent University, UK",
        description:
          "Awarded a Master of Science in Civil Engineering with Distinction and recognized as the most outstanding student in the cohort. Served as class academic representative and founded the NTU Chess Society — completing a demanding year of study with support from the Commonwealth Scholarship Commission, UK.",
        href: "https://www.linkedin.com/posts/sunday-okafor_ntugraduation-mscbagged-csc-activity-6610700597085650944-WDHN",
        fit: "cover",
        image: img("legacy-msc-graduation.jpg", 0.5, 0.05, 1.18),
        imageConfig: config(0.5, 0.05, 1.18),
        extraLinks: [],
      },
      {
        id: "achieve-csc",
        year: "2019",
        title: "Commonwealth Shared Scholarship",
        org: "UK Commonwealth Scholarship Commission",
        description:
          "Received full funding for MSc study at Nottingham Trent University — awarded to exceptional students from Commonwealth nations who demonstrate academic excellence and leadership potential.",
        href: "",
        fit: "cover",
        image: img("legacy-commonwealth-scholarship.png", 0.5, 0.5),
        imageConfig: config(0.5, 0.5),
        extraLinks: [],
      },
    ],
  },
  journey: {
    eyebrow: "Career Journey",
    title: "Built on",
    titleAccent: "Hard Work",
    titleAfter: "& Global Experience",
    quote:
      "The goal is not just to earn degrees — it is to use knowledge to build safer roads and better lives.",
    timeline: [
      {
        id: "journey-pe",
        year: "2026",
        title: "Licensed Professional Engineer (PE)",
        org: "Texas Board of Professional Engineers and Land Surveyors",
        detail:
          "Obtained PE licensure, the gold standard credential for practicing engineers in the United States, demonstrating mastery of civil engineering and public safety responsibility.",
      },
      {
        id: "journey-garver",
        year: "2024",
        title: "Garver — Project Engineer",
        org: "Garver, USA",
        detail:
          "Delivering transportation infrastructure projects across the United States, applying research-backed expertise to real-world road safety and mobility challenges.",
      },
      {
        id: "journey-phd",
        year: "2024",
        title: "PhD in Civil Engineering — Transportation Systems",
        org: "The University of Alabama",
        detail:
          "Dissertation research on integrating connected vehicle data for proactive road safety improvement at the Alabama Transportation Institute — one of the nation's premier transportation research centers.",
      },
      {
        id: "journey-lifesavers",
        year: "2023",
        title: "LIFESAVERS Traffic Safety Scholar",
        org: "LIFESAVERS National Conference — Seattle, WA",
        detail:
          "Selected as a scholar at the leading national conference on highway safety priorities, recognizing emerging researchers making an impact in road safety science.",
      },
      {
        id: "journey-asa",
        year: "2022",
        title: "President, African Students Association",
        org: "The University of Alabama",
        detail:
          "Led the ASA executive board, organizing events that celebrated African culture, supported incoming international students, and built community across the campus.",
      },
      {
        id: "journey-gra",
        year: "2021",
        title: "Graduate Research Assistant",
        org: "Alabama Transportation Institute, The University of Alabama",
        detail:
          "Conducted funded research across the Center for Transportation Operations, Planning and Safety; the Transportation Policy Research Center; and the Alabama Mobility and Power Center.",
      },
      {
        id: "journey-msc",
        year: "2019",
        title: "MSc Civil Engineering — Commonwealth Scholar",
        org: "Nottingham Trent University, UK",
        detail:
          "Fully funded by the prestigious Commonwealth Shared Scholarship, awarded to exceptional students from Commonwealth nations demonstrating academic excellence and leadership potential.",
      },
    ],
    portraitImage: img("legacy-grad-pensive.webp", 0.5, 0.18),
    portraitImageConfig: config(0.5, 0.18),
    secondaryImageA: img("legacy-msc-graduation.jpg", 0.5, 0.05),
    secondaryImageAConfig: config(0.5, 0.05),
    secondaryImageB: img("legacy-garver-award-1.png", 0.5, 0.5),
    secondaryImageBConfig: config(0.5, 0.5),
  },
  updatedAt: "",
};
