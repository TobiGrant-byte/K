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
import {
  normalizePublicationsContent,
  publicationsSeedPayload,
  PUBLICATIONS_PUBLIC_EMPTY,
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
  if (!data) return { ...PUBLICATIONS_PUBLIC_EMPTY };
  return normalizePublicationsContent(data, dateString(data.updatedAt));
}

/** Public / SSR: Firebase only — never reinject seed copy. */
export async function fetchPublicationsContent(): Promise<PublicationsContent> {
  if (!firebaseConfigured) return { ...PUBLICATIONS_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PUBLICATIONS_DOC_PATH.collection,
        PUBLICATIONS_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PUBLICATIONS_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PUBLICATIONS_PUBLIC_EMPTY };
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
  const seed = publicationsSeedPayload();

  if (snap.exists()) {
    const current = fromFirestoreData(snap.data());
    const needsTips = current.tips.items.length === 0;
    const needsPress = current.items.length === 0;
    const needsHeader = !current.title.trim() || !current.subtitle.trim();
    if (!needsTips && !needsPress && !needsHeader) return current;

    const merged = toPublicationsWritePayload({
      title: current.title.trim() || seed.title,
      titleAccent: current.titleAccent.trim() || seed.titleAccent,
      subtitle: current.subtitle.trim() || seed.subtitle,
      items: needsPress ? seed.items : current.items,
      tips: needsTips ? seed.tips : current.tips,
    });
    await setDoc(ref, {
      ...merged,
      updatedAt: serverTimestamp(),
    });
    return { ...merged, updatedAt: new Date().toISOString() };
  }

  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
