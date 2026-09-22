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
import { PROFILE_PUBLIC_EMPTY } from "@/lib/domains/profile/empty";
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
  if (!data) return { ...PROFILE_PUBLIC_EMPTY };
  return normalizeProfileContent(data, dateString(data.updatedAt));
}

/**
 * Public / SSR: Firebase only. Missing doc → empty home/hobbies; About keeps seed text.
 */
export async function fetchProfileContent(): Promise<ProfileContent> {
  if (!firebaseConfigured) return { ...PROFILE_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PROFILE_DOC_PATH.collection,
        PROFILE_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PROFILE_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PROFILE_PUBLIC_EMPTY };
  }
}

export async function saveProfileContent(
  input: ProfileContentInput,
): Promise<ProfileContent> {
  requireFirebase();
  const payload = toProfileWritePayload(input);
  if (!payload.home.roles.length) {
    throw new Error("Add at least one professional role.");
  }
  if (!payload.home.quote.trim()) {
    throw new Error("Home quote is required.");
  }
  if (!payload.about.title.trim() || !payload.about.excerpt.trim() || !payload.about.body.trim()) {
    throw new Error("About title, excerpt, and body are required.");
  }
  if (!payload.hobbies.items.length) {
    throw new Error("Add at least one hobbies card with a title and description.");
  }
  const ref = doc(
    getFirebaseFirestore(),
    PROFILE_DOC_PATH.collection,
    PROFILE_DOC_PATH.id,
  );
  await setDoc(ref, {
    home: payload.home,
    about: payload.about,
    hobbies: payload.hobbies,
    updatedAt: serverTimestamp(),
  });
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
}

/** Admin: seed PROFILE_FALLBACK once if the doc does not exist. */
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
    hobbies: PROFILE_FALLBACK.hobbies,
  });
  await setDoc(ref, {
    home: seed.home,
    about: seed.about,
    hobbies: seed.hobbies,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
