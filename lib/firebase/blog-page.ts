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
  BLOG_PAGE_PUBLIC_EMPTY,
  blogPageSeedPayload,
  normalizeBlogPageContent,
  toBlogPageWritePayload,
} from "@/lib/domains/blog/page-normalize";
import type {
  BlogPageContent,
  BlogPageContentInput,
} from "@/lib/domains/blog/page-types";

export const BLOG_PAGE_DOC_PATH = {
  collection: "content",
  id: "blog",
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

function fromFirestoreData(data: DocumentData | undefined): BlogPageContent {
  if (!data) return { ...BLOG_PAGE_PUBLIC_EMPTY };
  return normalizeBlogPageContent(data, dateString(data.updatedAt));
}

/** Public: Firebase only — empty subtitle if missing. */
export async function fetchBlogPageContent(): Promise<BlogPageContent> {
  if (!firebaseConfigured) return { ...BLOG_PAGE_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        BLOG_PAGE_DOC_PATH.collection,
        BLOG_PAGE_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...BLOG_PAGE_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...BLOG_PAGE_PUBLIC_EMPTY };
  }
}

export async function saveBlogPageContent(
  input: BlogPageContentInput,
): Promise<BlogPageContent> {
  requireFirebase();
  const payload = toBlogPageWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    BLOG_PAGE_DOC_PATH.collection,
    BLOG_PAGE_DOC_PATH.id,
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

/** Admin: seed once with the original subtitle if the doc does not exist. */
export async function ensureBlogPageContentSeeded(): Promise<BlogPageContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    BLOG_PAGE_DOC_PATH.collection,
    BLOG_PAGE_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) return fromFirestoreData(snap.data());

  const seed = blogPageSeedPayload();
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
