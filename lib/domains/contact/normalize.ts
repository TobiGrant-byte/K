import { CONTACT_FALLBACK } from "@/lib/domains/contact/defaults";
import type {
  ContactContent,
  ContactContentInput,
  ContactTopic,
} from "@/lib/domains/contact/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeTopic(value: unknown, index: number): ContactTopic | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const label = asString(raw.label).trim();
  const detail = asString(raw.detail).trim();
  if (!label || !detail) return null;
  return {
    id: asString(raw.id).trim() || `topic-${index + 1}`,
    label,
    detail,
  };
}

export function normalizeContactTopics(value: unknown): ContactTopic[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeTopic(item, index))
    .filter((item): item is ContactTopic => Boolean(item));
}

export function normalizeContactContent(
  input?: Partial<ContactContent> | Record<string, unknown> | null,
  updatedAt = "",
): ContactContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    eyebrow: asString(raw.eyebrow).trim(),
    title: asString(raw.title).trim(),
    titleAccent: asString(raw.titleAccent).trim(),
    subtitle: asString(raw.subtitle).trim(),
    topics: normalizeContactTopics(raw.topics),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function toContactWritePayload(
  input: ContactContentInput,
): ContactContentInput {
  const normalized = normalizeContactContent(input);
  return {
    eyebrow: normalized.eyebrow,
    title: normalized.title,
    titleAccent: normalized.titleAccent,
    subtitle: normalized.subtitle,
    topics: normalized.topics,
  };
}

export function contactSeedPayload(): ContactContentInput {
  return toContactWritePayload({
    eyebrow: CONTACT_FALLBACK.eyebrow,
    title: CONTACT_FALLBACK.title,
    titleAccent: CONTACT_FALLBACK.titleAccent,
    subtitle: CONTACT_FALLBACK.subtitle,
    topics: CONTACT_FALLBACK.topics,
  });
}

export const CONTACT_PUBLIC_EMPTY: ContactContent = {
  eyebrow: "",
  title: "",
  titleAccent: "",
  subtitle: "",
  topics: [],
  updatedAt: "",
};
