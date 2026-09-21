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
  normalizePhilanthropyContent,
  philanthropySeedPayload,
  PHILANTHROPY_PUBLIC_EMPTY,
  toPhilanthropyWritePayload,
} from "@/lib/domains/philanthropy/normalize";
import type {
  PhilanthropyContent,
  PhilanthropyContentInput,
} from "@/lib/domains/philanthropy/types";

export const PHILANTHROPY_DOC_PATH = {
  collection: "content",
  id: "philanthropy",
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

function fromFirestoreData(data: DocumentData | undefined): PhilanthropyContent {
  if (!data) return { ...PHILANTHROPY_PUBLIC_EMPTY };
  return normalizePhilanthropyContent(data, dateString(data.updatedAt));
}

/** Public / SSR: Firebase only — never reinject seed copy. */
export async function fetchPhilanthropyContent(): Promise<PhilanthropyContent> {
  if (!firebaseConfigured) return { ...PHILANTHROPY_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PHILANTHROPY_DOC_PATH.collection,
        PHILANTHROPY_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PHILANTHROPY_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PHILANTHROPY_PUBLIC_EMPTY };
  }
}

export async function savePhilanthropyContent(
  input: PhilanthropyContentInput,
): Promise<PhilanthropyContent> {
  requireFirebase();
  const payload = toPhilanthropyWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    PHILANTHROPY_DOC_PATH.collection,
    PHILANTHROPY_DOC_PATH.id,
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

export async function ensurePhilanthropyContentSeeded(): Promise<PhilanthropyContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    PHILANTHROPY_DOC_PATH.collection,
    PHILANTHROPY_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = philanthropySeedPayload();
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
