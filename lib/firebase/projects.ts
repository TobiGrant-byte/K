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
  normalizeProjectsContent,
  projectsSeedPayload,
  PROJECTS_PUBLIC_EMPTY,
  toProjectsWritePayload,
} from "@/lib/domains/projects/normalize";
import type {
  ProjectsContent,
  ProjectsContentInput,
} from "@/lib/domains/projects/types";

export const PROJECTS_DOC_PATH = {
  collection: "content",
  id: "projects",
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

function fromFirestoreData(data: DocumentData | undefined): ProjectsContent {
  if (!data) return { ...PROJECTS_PUBLIC_EMPTY };
  return normalizeProjectsContent(data, dateString(data.updatedAt));
}

/** Public / SSR: Firebase only — never reinject seed copy. */
export async function fetchProjectsContent(): Promise<ProjectsContent> {
  if (!firebaseConfigured) return { ...PROJECTS_PUBLIC_EMPTY };
  try {
    const snap = await getDoc(
      doc(
        getFirebaseFirestore(),
        PROJECTS_DOC_PATH.collection,
        PROJECTS_DOC_PATH.id,
      ),
    );
    if (!snap.exists()) return { ...PROJECTS_PUBLIC_EMPTY };
    return fromFirestoreData(snap.data());
  } catch {
    return { ...PROJECTS_PUBLIC_EMPTY };
  }
}

export async function saveProjectsContent(
  input: ProjectsContentInput,
): Promise<ProjectsContent> {
  requireFirebase();
  const payload = toProjectsWritePayload(input);
  const ref = doc(
    getFirebaseFirestore(),
    PROJECTS_DOC_PATH.collection,
    PROJECTS_DOC_PATH.id,
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

/**
 * Ensure a projects doc exists. Seeds empty content only (no sample projects).
 * Clears previously auto-seeded dummy entries if still present.
 */
export async function ensureProjectsContentSeeded(): Promise<ProjectsContent> {
  requireFirebase();
  const ref = doc(
    getFirebaseFirestore(),
    PROJECTS_DOC_PATH.collection,
    PROJECTS_DOC_PATH.id,
  );
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const existing = fromFirestoreData(snap.data());
    const seedIds = new Set([
      "proj-safety-1",
      "proj-ops-1",
      "proj-safety-ops-1",
      "proj-its-1",
      "proj-others-1",
      "project-safety",
      "project-operations",
      "project-safety-operations",
      "project-its",
      "project-others",
    ]);
    const onlySeedData =
      existing.items.length > 0 &&
      existing.items.every((item) => seedIds.has(item.id));
    if (!onlySeedData) return existing;
  }

  const seed = projectsSeedPayload();
  await setDoc(ref, {
    ...seed,
    updatedAt: serverTimestamp(),
  });
  return {
    ...seed,
    updatedAt: new Date().toISOString(),
  };
}
