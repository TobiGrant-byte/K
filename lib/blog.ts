export type BlogCategory = "Family" | "Career" | "Society" | "Reflections";
export const DEFAULT_BLOG_AUTHOR = "Dr. Sunday Okafor";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  author: string;
  /** HTML subset: p/br/strong/em/img */
  excerpt: string;
  /** HTML subset: p/br/strong/em/img */
  body: string;
  category: BlogCategory;
  coverImage?: string;
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

export const MAX_EXCERPT_IMAGES = 1;
export const MAX_BODY_IMAGES = 3;
/** Cover + excerpt + body images (for ImageKit sync caps). */
export const MAX_BLOG_IMAGES = 1 + MAX_EXCERPT_IMAGES + MAX_BODY_IMAGES;

/** Canonical display/crop size — all blog frames use 16:10. */
export const BLOG_IMAGE_ASPECT = 16 / 10;
export const BLOG_IMAGE_WIDTH = 1200;
export const BLOG_IMAGE_HEIGHT = 750;

const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "IMG",
  "DIV",
]);

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

/** Strip tags for cards / OG / share text. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Short blurb for social/share previews — title stays separate. */
export function truncateShareExcerpt(excerpt: string, maxLength = 110): string {
  const text = htmlToPlainText(excerpt);
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.trimEnd()}…`;
}

export const SITE_URL = "https://sundayokafor.com";

export function toShareJpegUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("imagekit.io")) return url;
    parsed.search = "";
    parsed.searchParams.set("tr", "f-jpg,w-1200,h-630,c-at_max,q-65");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function withShareCacheBust(pathOrUrl: string, version: string): string {
  const url = new URL(pathOrUrl, SITE_URL);
  url.searchParams.set("v", version.slice(0, 12) || "1");
  return url.toString();
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function countHtmlImages(html: string): number {
  const matches = html.match(/<img\b[^>]*>/gi);
  return matches?.length ?? 0;
}

export function extractHtmlImageUrls(html: string): string[] {
  const urls: string[] = [];
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[1]) urls.push(match[1]);
  }
  return urls;
}

export function richTextHasContent(html: string): boolean {
  if (countHtmlImages(html) > 0) return true;
  return htmlToPlainText(html).length > 0;
}

/** Cover + every ImageKit/URL embedded in excerpt & body. */
export function collectPostImageUrls(
  coverImage: string | undefined,
  excerpt: string,
  body: string,
): string[] {
  return [
    ...new Set(
      [
        ...(coverImage ? [coverImage] : []),
        ...extractHtmlImageUrls(excerpt),
        ...extractHtmlImageUrls(body),
      ].filter(Boolean),
    ),
  ];
}

/**
 * Allow only a tiny HTML subset for blog fields.
 * Converts legacy `{{img:url}}` markers and escapes unknown tags.
 */
export function sanitizeBlogHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Legacy marker → <img>
  let html = input.replace(
    /\{\{\s*img:\s*(https?:\/\/[^}\s]+)\s*\}\}/gi,
    '<img src="$1" alt="" />',
  );

  // Plain text with no tags → wrap paragraphs
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    const paragraphs = html
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeText(p).replace(/\n/g, "<br />")}</p>`);
    return paragraphs.join("") || "";
  }

  if (typeof window === "undefined") {
    return sanitizeBlogHtmlServer(html);
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  return serializeAllowed(template.content).trim();
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSafeImageSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function serializeAllowed(root: ParentNode): string {
  let out = "";
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += escapeText(node.textContent || "");
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;

    if (!ALLOWED_TAGS.has(tag)) {
      out += serializeAllowed(el);
      return;
    }

    if (tag === "BR") {
      out += "<br />";
      return;
    }

    if (tag === "IMG") {
      const src = el.getAttribute("src") || "";
      if (!isSafeImageSrc(src)) return;
      const width = el.getAttribute("width") || "";
      const height = el.getAttribute("height") || "";
      const styleWidth = el.style.width || "";
      const styleHeight = el.style.height || "";
      const attrs = [`src="${escapeText(src)}"`, 'alt=""'];
      if (/^\d+$/.test(width)) attrs.push(`width="${width}"`);
      if (/^\d+$/.test(height)) attrs.push(`height="${height}"`);
      const styleParts: string[] = [];
      if (/^[\d.]+(%|px)$/.test(styleWidth)) styleParts.push(`width:${styleWidth}`);
      if (/^[\d.]+(%|px)$/.test(styleHeight) || styleHeight === "auto") {
        styleParts.push(`height:${styleHeight}`);
      }
      if (styleParts.length) attrs.push(`style="${styleParts.join(";")}"`);
      out += `<img ${attrs.join(" ")} />`;
      return;
    }

    if (tag === "DIV") {
      const inner = serializeAllowed(el).trim();
      if (inner) out += `<p>${inner}</p>`;
      return;
    }

    if (tag === "B") {
      out += `<strong>${serializeAllowed(el)}</strong>`;
      return;
    }
    if (tag === "I") {
      out += `<em>${serializeAllowed(el)}</em>`;
      return;
    }

    const inner = serializeAllowed(el);
    const lower = tag.toLowerCase();
    out += `<${lower}>${inner}</${lower}>`;
  });
  return out;
}

/** Regex-based sanitizer for SSR / Node. */
function sanitizeBlogHtmlServer(html: string): string {
  let out = html
    .replace(/\{\{\s*img:\s*(https?:\/\/[^}\s]+)\s*\}\}/gi, '<img src="$1" alt="" />')
    .replace(/<\/?(script|iframe|object|embed|link|style|meta)[^>]*>/gi, "");

  // Drop on* handlers
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Normalize bold/italic aliases
  out = out.replace(/<\/?b\b[^>]*>/gi, (m) =>
    m.startsWith("</") ? "</strong>" : "<strong>",
  );
  out = out.replace(/<\/?i\b[^>]*>/gi, (m) =>
    m.startsWith("</") ? "</em>" : "<em>",
  );

  // Keep only allowlisted tags; strip others but keep children text via crude pass
  out = out.replace(
    /<\/?(?!\/?(?:p|br|strong|em|img)\b)[a-z0-9:-]+\b[^>]*>/gi,
    "",
  );

  // Validate img src (keep optional size attrs)
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    const src = srcMatch?.[1] || "";
    if (!isSafeImageSrc(src)) return "";
    const width = tag.match(/\bwidth=["'](\d+)["']/i)?.[1];
    const height = tag.match(/\bheight=["'](\d+)["']/i)?.[1];
    const style = tag.match(/\bstyle=["']([^"']*)["']/i)?.[1] || "";
    const styleWidth = style.match(/width\s*:\s*([\d.]+(?:%|px))/i)?.[0];
    const styleHeight = style.match(/height\s*:\s*([\d.]+(?:%|px)|auto)/i)?.[0];
    const attrs = [`src="${src}"`, 'alt=""'];
    if (width) attrs.push(`width="${width}"`);
    if (height) attrs.push(`height="${height}"`);
    const styleParts = [styleWidth, styleHeight].filter(Boolean);
    if (styleParts.length) attrs.push(`style="${styleParts.join(";")}"`);
    return `<img ${attrs.join(" ")} />`;
  });

  return out.trim();
}

/** Convert legacy plain / marker body into HTML once when opening the editor. */
export function migrateLegacyRichHtml(content: string): string {
  if (!content) return "";
  if (/<img\b/i.test(content) || /<(p|strong|em)\b/i.test(content)) {
    return sanitizeBlogHtml(content);
  }
  return sanitizeBlogHtml(content);
}
