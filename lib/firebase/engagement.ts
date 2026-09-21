import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import {
  firebaseConfigured,
  getFirebaseFirestore,
} from "@/lib/firebase/config";

const VISITOR_KEY = "blog:visitor-id:v1";

export type BlogComment = {
  id: string;
  authorName: string;
  anonymous: boolean;
  body: string;
  createdAt: string;
};

/** Comment row for admin moderation (no email is stored on comments today). */
export type AdminBlogComment = BlogComment & {
  postId: string;
  postTitle: string;
  postSlug: string;
  postPublished: boolean;
};

function commentFromDoc(
  id: string,
  data: Record<string, unknown>,
): Omit<BlogComment, "id"> & { id: string } {
  return {
    id,
    authorName: String(data.authorName ?? ""),
    anonymous: Boolean(data.anonymous),
    body: String(data.body ?? ""),
    createdAt: dateString(data.createdAt),
  };
}

function dateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 12) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now().toString(36)}`;
  }
}

export function subscribeToPostLoves(
  postId: string,
  onChange: (count: number, lovedByMe: boolean) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured || !postId) {
    onChange(0, false);
    return () => undefined;
  }
  const visitorId = getVisitorId();
  const lovesRef = collection(getFirebaseFirestore(), "posts", postId, "loves");
  return onSnapshot(
    lovesRef,
    (snap) => {
      onChange(
        snap.size,
        visitorId ? snap.docs.some((d) => d.id === visitorId) : false,
      );
    },
    (err) => onError?.(err),
  );
}

export async function togglePostLove(postId: string): Promise<boolean> {
  if (!firebaseConfigured || !postId) {
    throw new Error("Firebase is not configured.");
  }
  const visitorId = getVisitorId();
  if (!visitorId) throw new Error("Could not start a love session.");
  const loveRef = doc(
    getFirebaseFirestore(),
    "posts",
    postId,
    "loves",
    visitorId,
  );
  const existing = await getDoc(loveRef);
  if (existing.exists()) {
    await deleteDoc(loveRef);
    return false;
  }
  await setDoc(loveRef, { createdAt: serverTimestamp() });
  return true;
}

export function subscribeToPostComments(
  postId: string,
  onChange: (comments: BlogComment[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured || !postId) {
    onChange([]);
    return () => undefined;
  }
  const commentsQuery = query(
    collection(getFirebaseFirestore(), "posts", postId, "comments"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    commentsQuery,
    (snap) => {
      onChange(
        snap.docs.map((d) => commentFromDoc(d.id, d.data() as Record<string, unknown>)),
      );
    },
    (err) => onError?.(err),
  );
}

/**
 * Live-merge comments across posts for the admin Comments panel.
 * Uses per-post listeners (same paths as public comments) — no collection-group index required.
 */
export function subscribeToAllCommentsForAdmin(
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    published: boolean;
  }>,
  onChange: (comments: AdminBlogComment[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured) {
    onChange([]);
    return () => undefined;
  }

  if (!posts.length) {
    onChange([]);
    return () => undefined;
  }

  const byPost = new Map<string, AdminBlogComment[]>();
  const unsubs: Unsubscribe[] = [];

  const emit = () => {
    const merged = [...byPost.values()].flat();
    merged.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    onChange(merged);
  };

  for (const post of posts) {
    const commentsQuery = query(
      collection(getFirebaseFirestore(), "posts", post.id, "comments"),
      orderBy("createdAt", "desc"),
    );
    unsubs.push(
      onSnapshot(
        commentsQuery,
        (snap) => {
          byPost.set(
            post.id,
            snap.docs.map((d) => {
              const base = commentFromDoc(
                d.id,
                d.data() as Record<string, unknown>,
              );
              return {
                ...base,
                postId: post.id,
                postTitle: post.title,
                postSlug: post.slug,
                postPublished: post.published,
              };
            }),
          );
          emit();
        },
        (err) => onError?.(err),
      ),
    );
  }

  return () => {
    for (const unsub of unsubs) unsub();
  };
}

/** Admin-only deletion — enforced by Firestore rules (`isAdmin()`). */
export async function deletePostComment(
  postId: string,
  commentId: string,
): Promise<void> {
  if (!firebaseConfigured || !postId || !commentId) {
    throw new Error("Missing post or comment id.");
  }
  await deleteDoc(
    doc(getFirebaseFirestore(), "posts", postId, "comments", commentId),
  );
}

export async function getPostEngagementCounts(
  postId: string,
): Promise<{ loves: number; comments: number }> {
  if (!firebaseConfigured || !postId) {
    return { loves: 0, comments: 0 };
  }
  const db = getFirebaseFirestore();
  const [lovesSnap, commentsSnap] = await Promise.all([
    getCountFromServer(collection(db, "posts", postId, "loves")),
    getCountFromServer(collection(db, "posts", postId, "comments")),
  ]);
  return {
    loves: lovesSnap.data().count,
    comments: commentsSnap.data().count,
  };
}

export function subscribeToPostEngagementCounts(
  postId: string,
  onChange: (counts: { loves: number; comments: number }) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured || !postId) {
    onChange({ loves: 0, comments: 0 });
    return () => undefined;
  }

  let loves = 0;
  let comments = 0;
  const emit = () => onChange({ loves, comments });
  const db = getFirebaseFirestore();

  const unsubLoves = onSnapshot(
    collection(db, "posts", postId, "loves"),
    (snap) => {
      loves = snap.size;
      emit();
    },
    (err) => onError?.(err),
  );
  const unsubComments = onSnapshot(
    collection(db, "posts", postId, "comments"),
    (snap) => {
      comments = snap.size;
      emit();
    },
    (err) => onError?.(err),
  );

  return () => {
    unsubLoves();
    unsubComments();
  };
}

export async function addPostComment(
  postId: string,
  input: { body: string; authorName: string; anonymous: boolean },
): Promise<void> {
  if (!firebaseConfigured || !postId) {
    throw new Error("Firebase is not configured.");
  }
  const body = input.body.trim();
  if (!body) throw new Error("Write a comment first.");
  if (body.length > 2000) throw new Error("Comment is too long.");

  const anonymous = Boolean(input.anonymous);
  const authorName = anonymous ? "" : input.authorName.trim();
  if (!anonymous && !authorName) {
    throw new Error("Add your name, or comment anonymously.");
  }
  if (authorName.length > 80) throw new Error("Name is too long.");

  const commentsRef = collection(
    getFirebaseFirestore(),
    "posts",
    postId,
    "comments",
  );
  const commentRef = doc(commentsRef);
  await setDoc(commentRef, {
    body,
    authorName,
    anonymous,
    createdAt: serverTimestamp(),
  });
}
