import type { BlogPost } from "@/lib/blog";

const LIST_KEY = "blog:published-list:v1";
const POST_PREFIX = "blog:post:v1:";
const POST_INDEX_KEY = "blog:post-index:v1";

const MAX_CACHED_LIST = 40;
const MAX_CACHED_POSTS = 20;

let listSnapshot: BlogPost[] | null | undefined;
let listSnapshotRaw: string | null | undefined;
const postSnapshots = new Map<string, { raw: string; post: BlogPost }>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function postFingerprint(post: BlogPost): string {
  return [
    post.id,
    post.slug,
    post.updatedAt,
    post.title,
    post.excerpt,
    post.body,
    post.coverImage ?? "",
    post.published ? "1" : "0",
  ].join("|");
}

export function postsAreEqual(
  a: BlogPost | null | undefined,
  b: BlogPost | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return postFingerprint(a) === postFingerprint(b);
}

export function postListsAreEqual(a: BlogPost[], b: BlogPost[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!postsAreEqual(a[i], b[i])) return false;
  }
  return true;
}

/** Lightweight list cache (full post objects as returned by Firestore). */
export function readCachedPostList(): BlogPost[] | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(LIST_KEY);
  if (raw === listSnapshotRaw && listSnapshot !== undefined) {
    return listSnapshot;
  }
  listSnapshotRaw = raw;
  const parsed = safeParse<BlogPost[]>(raw);
  if (!Array.isArray(parsed) || !parsed.length) {
    listSnapshot = null;
    return null;
  }
  listSnapshot = parsed.slice(0, MAX_CACHED_LIST);
  return listSnapshot;
}

export function writeCachedPostList(posts: BlogPost[]): void {
  if (!canUseStorage()) return;
  try {
    const trimmed = posts.slice(0, MAX_CACHED_LIST);
    const raw = JSON.stringify(trimmed);
    localStorage.setItem(LIST_KEY, raw);
    listSnapshotRaw = raw;
    listSnapshot = trimmed;
  } catch {
    /* quota / private mode */
  }
}

function readPostIndex(): string[] {
  const parsed = safeParse<string[]>(localStorage.getItem(POST_INDEX_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function writePostIndex(slugs: string[]): void {
  try {
    localStorage.setItem(POST_INDEX_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

export function readCachedPost(slug: string): BlogPost | null {
  if (!canUseStorage() || !slug) return null;
  const raw = localStorage.getItem(POST_PREFIX + slug);
  const cached = postSnapshots.get(slug);
  if (cached && cached.raw === raw) return cached.post;
  const parsed = safeParse<BlogPost>(raw);
  if (!parsed || parsed.slug !== slug) {
    postSnapshots.delete(slug);
    return null;
  }
  postSnapshots.set(slug, { raw: raw ?? "", post: parsed });
  return parsed;
}

export function writeCachedPost(post: BlogPost): void {
  if (!canUseStorage() || !post.slug) return;
  try {
    const raw = JSON.stringify(post);
    localStorage.setItem(POST_PREFIX + post.slug, raw);
    postSnapshots.set(post.slug, { raw, post });
    const index = readPostIndex().filter((s) => s !== post.slug);
    index.unshift(post.slug);
    while (index.length > MAX_CACHED_POSTS) {
      const drop = index.pop();
      if (drop) {
        localStorage.removeItem(POST_PREFIX + drop);
        postSnapshots.delete(drop);
      }
    }
    writePostIndex(index);
  } catch {
    /* quota / private mode */
  }
}

export function removeCachedPost(slug: string): void {
  if (!canUseStorage() || !slug) return;
  try {
    localStorage.removeItem(POST_PREFIX + slug);
    postSnapshots.delete(slug);
    writePostIndex(readPostIndex().filter((s) => s !== slug));
  } catch {
    /* ignore */
  }
}
