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
 * Top-level nav order:
 * Home → About → Profession → Gallery → Impacts → Blog → Contact
 */
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Profession",
    children: [
      { label: "Research and Development", href: "/research" },
      { label: "Publications", href: "/publications" },
      { label: "Achievements", href: "/achievements" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Impacts", href: "/philanthropy" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Flat list for footer / search (no Admin — that is session-only in the navbar). */
export const navLinks: NavLink[] = navItems.flatMap((item) =>
  isNavGroup(item) ? item.children : [item],
);

export function pathInGroup(pathname: string, group: NavGroup): boolean {
  return group.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}
