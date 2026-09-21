import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import {
  firebaseConfigured,
  getFirebaseFirestore,
  missingFirebaseEnvironmentVariables,
} from "@/lib/firebase/config";
import { RESEARCH_FALLBACK } from "@/lib/domains/research/defaults";
import {
  normalizeResearchContent,
  toResearchWritePayload,
} from "@/lib/domains/research/normalize";
import type {
  ResearchContent,
  ResearchContentInput,
} from "@/lib/domains/research/types";

/** Same `content` collection as Profile — document id `research`. */
export const RESEARCH_DOC_PATH = {
  collection: "content",
  id: "research",
} as const;

function dateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return "";
}

function requireFirebase() {
  if (!firebaseConfigured) {
    throw new Error(
      `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
    );
  }
}

function fromFirestoreData(data: DocumentData | undefined): ResearchContent {
  if (!data) return { ...RESEARCH_FALLBACK };
  return normalizeResearchContent(data, dateString(data.updatedAt));
}

export async function fetchResearchContent(): Promise<ResearchContent> {
  if (!firebaseConfigured) return { ...RESEARCH_FALLBACK };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        RESEARCH_DOC_PATH.collection,
        RESEARCH_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...RESEARCH_FALLBACK };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...RESEARCH_FALLBACK };
  }
}

export async function saveResearchContent(
  input: ResearchContentInput,
): Promise<ResearchContent> {
  requireFirebase();
  const payload = toResearchWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    RESEARCH_DOC_PATH.collection,
    RESEARCH_DOC_PATH.id,
  );
  // Full replace so legacy flat R&D fields are cleared on migrate.
  await setDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
}

export async function ensureResearchContentSeeded(): Promise<ResearchContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    RESEARCH_DOC_PATH.collection,
    RESEARCH_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = toResearchWritePayload({
    development: RESEARCH_FALLBACK.development,
    action: RESEARCH_FALLBACK.action,
  });
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
