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
  CONTACT_PUBLIC_EMPTY,
  contactSeedPayload,
  normalizeContactContent,
  toContactWritePayload,
} from "@/lib/domains/contact/normalize";
import type {
  ContactContent,
  ContactContentInput,
} from "@/lib/domains/contact/types";

export const CONTACT_DOC_PATH = {
  collection: "content",
  id: "contact",
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

function fromFirestoreData(data: DocumentData | undefined): ContactContent {
  if (!data) return { ...CONTACT_PUBLIC_EMPTY };
  return normalizeContactContent(data, dateString(data.updatedAt));
}

export async function fetchContactContent(): Promise<ContactContent> {
  if (!firebaseConfigured) return { ...CONTACT_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        CONTACT_DOC_PATH.collection,
        CONTACT_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...CONTACT_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...CONTACT_PUBLIC_EMPTY };
  }
}

export async function saveContactContent(
  input: ContactContentInput,
): Promise<ContactContent> {
  requireFirebase();
  const payload = toContactWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    CONTACT_DOC_PATH.collection,
    CONTACT_DOC_PATH.id,
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

export async function ensureContactContentSeeded(): Promise<ContactContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    CONTACT_DOC_PATH.collection,
    CONTACT_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = contactSeedPayload();
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
