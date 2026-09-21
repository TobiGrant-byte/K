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
import { PUBLICATIONS_FALLBACK } from "@/lib/domains/publications/defaults";
import {
  normalizePublicationsContent,
  toPublicationsWritePayload,
} from "@/lib/domains/publications/normalize";
import type {
  PublicationsContent,
  PublicationsContentInput,
} from "@/lib/domains/publications/types";

export const PUBLICATIONS_DOC_PATH = {
  collection: "content",
  id: "publications",
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

function fromFirestoreData(data: DocumentData | undefined): PublicationsContent {
  if (!data) return { ...PUBLICATIONS_FALLBACK };
  return normalizePublicationsContent(data, dateString(data.updatedAt));
}

export async function fetchPublicationsContent(): Promise<PublicationsContent> {
  if (!firebaseConfigured) return { ...PUBLICATIONS_FALLBACK };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PUBLICATIONS_DOC_PATH.collection,
        PUBLICATIONS_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PUBLICATIONS_FALLBACK };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PUBLICATIONS_FALLBACK };
  }
}

export async function savePublicationsContent(
  input: PublicationsContentInput,
): Promise<PublicationsContent> {
  requireFirebase();
  const payload = toPublicationsWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    PUBLICATIONS_DOC_PATH.collection,
    PUBLICATIONS_DOC_PATH.id,
  );
  await setDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
}

export async function ensurePublicationsContentSeeded(): Promise<PublicationsContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    PUBLICATIONS_DOC_PATH.collection,
    PUBLICATIONS_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = toPublicationsWritePayload({
    title: PUBLICATIONS_FALLBACK.title,
    titleAccent: PUBLICATIONS_FALLBACK.titleAccent,
    subtitle: PUBLICATIONS_FALLBACK.subtitle,
    items: PUBLICATIONS_FALLBACK.items,
    tips: PUBLICATIONS_FALLBACK.tips,
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
