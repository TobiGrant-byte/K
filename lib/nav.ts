export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  children: NavLink[];
};

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray(item.children);
}

/**
 * Top-level items with connected submenus:
 * - Work: academic / professional output
 * - Community: public & civic presence
 */
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Work",
    children: [
      { label: "Research and Development", href: "/research" },
      { label: "Publications", href: "/publications" },
      { label: "Achievements", href: "/achievements" },
    ],
  },
  { label: "Blog", href: "/blog" },
  {
    label: "Community",
    children: [
      { label: "Gallery", href: "/gallery" },
      { label: "Philanthropy", href: "/philanthropy" },
    ],
  },
];

/** Flat list for footer / search (no Admin — that is session-only in the navbar). */
export const navLinks: NavLink[] = navItems.flatMap((item) =>
  isNavGroup(item) ? item.children : [item],
);

export function pathInGroup(pathname: string, group: NavGroup): boolean {
  return group.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}
