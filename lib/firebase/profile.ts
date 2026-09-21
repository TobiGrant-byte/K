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
import { PROFILE_FALLBACK } from "@/lib/domains/profile/defaults";
import {
  normalizeProfileContent,
  toProfileWritePayload,
} from "@/lib/domains/profile/normalize";
import type {
  ProfileContent,
  ProfileContentInput,
} from "@/lib/domains/profile/types";

export const PROFILE_DOC_PATH = {
  collection: "content",
  id: "profile",
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

function fromFirestoreData(data: DocumentData | undefined): ProfileContent {
  if (!data) return { ...PROFILE_FALLBACK };
  return normalizeProfileContent(data, dateString(data.updatedAt));
}

/**
 * Public / SSR: load shared Profile content.
 * Missing doc → static fallback (existing site copy).
 */
export async function fetchProfileContent(): Promise<ProfileContent> {
  if (!firebaseConfigured) return { ...PROFILE_FALLBACK };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PROFILE_DOC_PATH.collection,
        PROFILE_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PROFILE_FALLBACK };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PROFILE_FALLBACK };
  }
}

/** Admin write — full document replace of editable fields. */
export async function saveProfileContent(
  input: ProfileContentInput,
): Promise<ProfileContent> {
  requireFirebase();
  const payload = toProfileWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    PROFILE_DOC_PATH.collection,
    PROFILE_DOC_PATH.id,
  );
  await setDoc(
    ref,
    {
      home: payload.home,
      about: payload.about,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * First-time seed: write static fallbacks if the doc does not exist yet.
 * Safe to call from Admin; does not overwrite existing CMS data.
 */
export async function ensureProfileContentSeeded(): Promise<ProfileContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    PROFILE_DOC_PATH.collection,
    PROFILE_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = toProfileWritePayload({
    home: PROFILE_FALLBACK.home,
    about: PROFILE_FALLBACK.about,
  });
  await setDoc(ref, {
    home: seed.home,
    about: seed.about,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
