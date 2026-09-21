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
  achievementsSeedPayload,
  ACHIEVEMENTS_PUBLIC_EMPTY,
  normalizeAchievementsContent,
  toAchievementsWritePayload,
} from "@/lib/domains/achievements/normalize";
import type {
  AchievementsContent,
  AchievementsContentInput,
} from "@/lib/domains/achievements/types";

export const ACHIEVEMENTS_DOC_PATH = {
  collection: "content",
  id: "achievements",
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

function fromFirestoreData(data: DocumentData | undefined): AchievementsContent {
  if (!data) return { ...ACHIEVEMENTS_PUBLIC_EMPTY };
  return normalizeAchievementsContent(data, dateString(data.updatedAt));
}

/** Public / SSR: Firebase only — never reinject seed copy. */
export async function fetchAchievementsContent(): Promise<AchievementsContent> {
  if (!firebaseConfigured) return { ...ACHIEVEMENTS_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        ACHIEVEMENTS_DOC_PATH.collection,
        ACHIEVEMENTS_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...ACHIEVEMENTS_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...ACHIEVEMENTS_PUBLIC_EMPTY };
  }
}

export async function saveAchievementsContent(
  input: AchievementsContentInput,
): Promise<AchievementsContent> {
  requireFirebase();
  const payload = toAchievementsWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    ACHIEVEMENTS_DOC_PATH.collection,
    ACHIEVEMENTS_DOC_PATH.id,
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

export async function ensureAchievementsContentSeeded(): Promise<AchievementsContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    ACHIEVEMENTS_DOC_PATH.collection,
    ACHIEVEMENTS_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = achievementsSeedPayload();
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
