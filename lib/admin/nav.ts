import type { AdminSection } from "@/lib/admin/ui-store";

export type AdminNavItem = {
  id: AdminSection;
  label: string;
  enabled: boolean;
  group?: string;
};

/**
 * CMS navigation. Comments live under Posts (View comments), not as a separate item.
 * Scholarship tips live under Publications — the Scholarship nav item stays hidden.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { id: "overview", label: "Overview", enabled: true },
  { id: "blog-posts", label: "Posts", enabled: true, group: "Blog" },
  { id: "gallery", label: "Media Library", enabled: true, group: "Media" },
  { id: "about", label: "Profile", enabled: true, group: "Site" },
  {
    id: "research-dev",
    label: "Research",
    enabled: true,
    group: "Site",
  },
  {
    id: "publications",
    label: "Publications",
    enabled: false,
    group: "Site",
  },
  {
    id: "scholarship",
    label: "Scholarship",
    enabled: false,
    group: "Professional",
  },
  {
    id: "achievements",
    label: "Achievements",
    enabled: false,
    group: "Professional",
  },
  {
    id: "philanthropy",
    label: "Impacts",
    enabled: false,
    group: "Site",
  },
];
export function isAdminNavEnabled(section: AdminSection): boolean {
  return ADMIN_NAV.find((n) => n.id === section)?.enabled ?? false;
}
export function sectionTitle(section: AdminSection): string {
  return ADMIN_NAV.find((n) => n.id === section)?.label ?? "Admin";
}

export function sectionBreadcrumb(section: AdminSection): string[] {
  const item = ADMIN_NAV.find((n) => n.id === section);
  if (!item) return ["Admin"];
  // Parent path only — section title is shown once in the header h1.
  if (item.group) return ["Admin", item.group];
  return ["Admin"];
}

/** Public site path for a CMS section, when one exists. */
export function sectionPublicPath(section: AdminSection): string | null {
  switch (section) {
    case "blog-posts":
      return "/blog";
    case "gallery":
      return "/gallery";
    case "about":
      return "/about";
    case "research-dev":
      return "/research";
    case "publications":
      return "/publications";
    case "scholarship":
      return "/scholarship";
    case "achievements":
      return "/achievements";
    case "philanthropy":
      return "/philanthropy";
    default:
      return null;
  }
}

export function sectionPublicLabel(section: AdminSection): string | null {
  switch (section) {
    case "blog-posts":
      return "View blog";
    case "gallery":
      return "View gallery";
    case "about":
      return "View about";
    case "research-dev":
      return "View research";
    case "publications":
      return "View publications";
    case "scholarship":
      return "View scholarship";
    case "achievements":
      return "View achievements";
    case "philanthropy":
      return "View impacts";
    default:
      return null;
  }
}

/** Public pages ready to preview from Overview. */
export const ADMIN_PUBLIC_QUICK_LINKS: Array<{
  href: string;
  label: string;
  hint: string;
}> = [
  { href: "/", label: "Home", hint: "Main site" },
  { href: "/blog", label: "Blog", hint: "Published posts" },
  { href: "/gallery", label: "Gallery", hint: "Public media" },
  { href: "/about", label: "About", hint: "Profile page" },
  { href: "/research", label: "Research", hint: "R&D and Research in Action" },
  { href: "/publications", label: "Publications", hint: "Press & scholarship tips" },
  { href: "/achievements", label: "Achievements", hint: "Credentials" },
  { href: "/philanthropy", label: "Impacts", hint: "Community work" },
  { href: "/contact", label: "Contact", hint: "Get in touch" },
];
