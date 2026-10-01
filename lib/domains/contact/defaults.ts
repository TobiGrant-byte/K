import type { ContactContent } from "@/lib/domains/contact/types";

export const CONTACT_FALLBACK: ContactContent = {
  eyebrow: "Contact",
  title: "Let's Start a",
  titleAccent: "Conversation",
  subtitle: "Get in touch about collaborations, speaking, or mentorship.",
  topics: [
    {
      id: "topic-professional",
      label: "Professional Engagement",
      detail: "Consulting and partnerships",
    },
    {
      id: "topic-speaking",
      label: "Public Speaking",
      detail: "Keynotes and panel discussion",
    },
    {
      id: "topic-collaboration",
      label: "Collaboration",
      detail: "Research and social programs",
    },
    {
      id: "topic-mentorship",
      label: "Mentorship",
      detail: "Career and personal development",
    },
  ],
  updatedAt: "",
};
