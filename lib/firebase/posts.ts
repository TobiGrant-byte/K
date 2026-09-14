import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  firebaseConfigured,
  getFirebaseFirestore,
  missingFirebaseEnvironmentVariables,
} from "./config";
import type { BlogPost } from "@/lib/blog";

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`The URL slug “${slug}” is already used by another post.`);
    this.name = "DuplicateSlugError";
  }
}

function dateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function postFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): BlogPost {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    category: data.category as BlogPost["category"],
    published: Boolean(data.published),
    excerpt: String(data.excerpt ?? ""),
    body: String(data.body ?? ""),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    images: Array.isArray(data.images) ? data.images.map(String).slice(0, 3) : [],
    createdAt: dateString(data.createdAt),
    updatedAt: dateString(data.updatedAt),
  };
}

export function subscribeToPublishedPosts(
  onPosts: (posts: BlogPost[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured) {
    onError(
      new Error(
        `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
      ),
    );
    return () => undefined;
  }
  // Equality-only query (no composite index). Sort newest-first in memory.
  const postsQuery = query(
    collection(getFirebaseFirestore(), "posts"),
    where("published", "==", true),
  );
  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts = snapshot.docs
        .map(postFromSnapshot)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      onPosts(posts);
    },
    onError,
  );
}

export function subscribeToAllPosts(
  onPosts: (posts: BlogPost[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured) {
    onError(
      new Error(
        `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
      ),
    );
    return () => undefined;
  }
  const postsQuery = query(
    collection(getFirebaseFirestore(), "posts"),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    postsQuery,
    (snapshot) => onPosts(snapshot.docs.map(postFromSnapshot)),
    onError,
  );
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  // Must constrain published==true so public Firestore rules accept the query.
  // (Slug-only queries fail for anonymous users and look like "Post not found".)
  const result = await getDocs(
    query(
      collection(getFirebaseFirestore(), "posts"),
      where("published", "==", true),
    ),
  );
  const match = result.docs
    .map(postFromSnapshot)
    .find((post) => post.slug === slug);
  return match ?? null;
}

export async function assertUniqueSlug(slug: string, currentPostId?: string): Promise<void> {
  const matches = await getDocs(
    query(
      collection(getFirebaseFirestore(), "posts"),
      where("slug", "==", slug),
    ),
  );
  if (matches.docs.some((snapshot) => snapshot.id !== currentPostId)) {
    throw new DuplicateSlugError(slug);
  }
}

export async function savePost(
  post: BlogPost,
  options: { creating: boolean },
): Promise<void> {
  if (post.images.length > 3) {
    throw new Error("A post cannot contain more than 3 images.");
  }
  await assertUniqueSlug(post.slug, options.creating ? undefined : post.id);

  const postRef = doc(getFirebaseFirestore(), "posts", post.id);
  const data = {
    title: post.title,
    slug: post.slug,
    category: post.category,
    published: post.published,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: post.coverImage ?? "",
    images: post.images,
    updatedAt: serverTimestamp(),
    ...(options.creating ? { createdAt: serverTimestamp() } : {}),
  };
  await setDoc(
    postRef,
    data,
    { merge: !options.creating },
  );
}

export async function removePost(postId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseFirestore(), "posts", postId));
}
