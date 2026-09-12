export type BlogCategory = "Family" | "Career" | "Society" | "Reflections";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: BlogCategory;
  coverImage?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Family",
  "Career",
  "Society",
  "Reflections",
];

/** Max images per post (cover counts toward this). */
export const MAX_BLOG_IMAGES = 3;

/** Canonical display/crop size — all blog frames use 16:10. */
export const BLOG_IMAGE_ASPECT = 16 / 10;
export const BLOG_IMAGE_WIDTH = 1200;
export const BLOG_IMAGE_HEIGHT = 750;

export const BLOG_STORAGE_KEY = "okafor-blog-posts-v1";
export const BLOG_AUTH_KEY = "okafor-blog-auth-v1";

/** Temporary demo credentials — replace with Firebase Auth later */
export const DEMO_ADMIN = {
  email: "admin@dr-okafor.com",
  password: "okafor-admin",
} as const;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function createId(): string {
  return `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadPosts(): BlogPost[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlogPost[];
    if (!Array.isArray(parsed)) return [];
    // Remove legacy demo/seed posts if still present
    const cleaned = parsed.filter((p) => !String(p.id).startsWith("seed_"));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function savePosts(posts: BlogPost[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("okafor-blog-updated"));
}

export function getPublishedPosts(): BlogPost[] {
  return loadPosts()
    .filter((p) => p.published)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return loadPosts().find((p) => p.slug === slug);
}

export function getPostById(id: string): BlogPost | undefined {
  return loadPosts().find((p) => p.id === id);
}

export function upsertPost(post: BlogPost): void {
  const posts = loadPosts();
  const i = posts.findIndex((p) => p.id === post.id);
  if (i >= 0) posts[i] = post;
  else posts.unshift(post);
  savePosts(posts);
}

export function deletePost(id: string): void {
  savePosts(loadPosts().filter((p) => p.id !== id));
}

export function isAdminLoggedIn(): boolean {
  if (!canUseStorage()) return false;
  return localStorage.getItem(BLOG_AUTH_KEY) === "1";
}

export function notifyAdminAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("okafor-blog-auth"));
}

export function loginAdmin(email: string, password: string): boolean {
  if (
    email.trim().toLowerCase() === DEMO_ADMIN.email &&
    password === DEMO_ADMIN.password
  ) {
    localStorage.setItem(BLOG_AUTH_KEY, "1");
    notifyAdminAuthChanged();
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(BLOG_AUTH_KEY);
  notifyAdminAuthChanged();
}

export function formatPostDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
