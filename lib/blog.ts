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

const seedPosts: BlogPost[] = [
  {
    id: "seed_1",
    slug: "keeping-going-every-day",
    title: "Keeping Going Every Day",
    excerpt:
      "A short reflection on persistence — in the classroom, on the corridor, and at home.",
    body: `Difficult days come. The work does not wait for perfect conditions, and neither do the people who depend on us.

I have learned that progress is often quiet: one more analysis, one more conversation, one more evening present with family. Keep going every day — not because it is easy, but because the road ahead is built that way.

This space will hold reflections on career, society, and the life behind the résumé.`,
    category: "Reflections",
    coverImage: "/images/hero-picture.jpeg",
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  },
  {
    id: "seed_2",
    slug: "safer-roads-and-shared-responsibility",
    title: "Safer Roads and Shared Responsibility",
    excerpt:
      "Why road safety is not only an engineering problem — it is a societal one.",
    body: `Engineering can model risk, redesign corridors, and bring connected vehicle data into the light. But safer roads also ask something of communities, institutions, and culture.

When we talk about crash analytics or inclusive mobility, we are talking about people getting home. That is the through-line of my work — and a theme I will return to here.`,
    category: "Society",
    coverImage: "/images/traffic-safety-scholars.jpg",
    images: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    published: true,
  },
];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadPosts(): BlogPost[] {
  if (!canUseStorage()) return seedPosts;
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(seedPosts));
      return seedPosts;
    }
    const parsed = JSON.parse(raw) as BlogPost[];
    return Array.isArray(parsed) ? parsed : seedPosts;
  } catch {
    return seedPosts;
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
