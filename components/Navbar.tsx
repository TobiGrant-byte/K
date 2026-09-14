"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { isNavGroup, navItems, pathInGroup, type NavGroup, type NavLink } from "@/lib/nav";
import { subscribeToAdminAuth } from "@/lib/firebase/auth";
import SiteSearch from "@/components/SiteSearch";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      className={`ml-1.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function DesktopDropdown({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = pathInGroup(pathname, group);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative h-full flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`font-title text-xs tracking-[1.5px] uppercase inline-flex items-center h-10 whitespace-nowrap transition-colors duration-300 cursor-pointer bg-transparent border-0 p-0 ${
          active || open ? "text-accent-light" : "text-white/75 hover:text-accent-light"
        }`}
      >
        {group.label}
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 z-[70] min-w-[220px] -translate-x-1/2 pt-2"
          >
            <div className="overflow-hidden rounded-xl border border-accent/25 bg-[rgba(5,13,26,0.98)] py-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
              {group.children.map((child) => {
                const isActive = linkActive(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 font-title text-[10px] uppercase tracking-[1.5px] no-underline transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent-light"
                        : "text-white/70 hover:bg-white/5 hover:text-accent-light"
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MobileGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathInGroup(pathname, group);
  const [open, setOpen] = useState(active);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg py-3.5 px-4 font-display text-[22px] transition-colors duration-200 cursor-pointer bg-transparent border-0 text-left ${
          active || open ? "font-medium text-accent-light" : "font-light text-white/75"
        }`}
      >
        {group.label}
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mb-1 ml-2 border-l border-white/10 pl-3">
              {group.children.map((child) => {
                const isActive = linkActive(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`block rounded-lg py-2.5 px-3 font-title text-[11px] uppercase tracking-[1.5px] no-underline transition-colors ${
                      isActive
                        ? "text-accent-light"
                        : "text-white/55 hover:text-accent-light"
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NavLeafLink({
  link,
  pathname,
  onNavigate,
  mobile,
}: {
  link: NavLink;
  pathname: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const active = linkActive(pathname, link.href);
  if (mobile) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className={`block rounded-lg py-3.5 px-4 font-display text-[22px] no-underline transition-colors duration-200 ${
          active ? "font-medium text-accent-light" : "font-light text-white/75 hover:text-accent-light"
        }`}
      >
        {link.label}
      </Link>
    );
  }
  return (
    <Link
      href={link.href}
      className={`font-title text-xs tracking-[1.5px] uppercase no-underline relative inline-flex items-center h-10 whitespace-nowrap transition-colors duration-300 after:content-[''] after:absolute after:bottom-2 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-[width] after:duration-300 hover:after:w-full hover:text-accent-light ${
        active ? "text-accent-light" : "text-white/75"
      }`}
    >
      {link.label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    return subscribeToAdminAuth((state) => {
      setAdminAuthed(state.status === "admin");
    });
  }, []);

  const closeMobile = () => setOpen(false);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-[background,border-color,backdrop-filter] duration-[400ms] ease-in-out ${
        solid
          ? "bg-[rgba(5,13,26,0.95)] backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 min-[1101px]:px-12 h-full flex items-center justify-between relative">
        <Link
          href="/"
          className="no-underline text-left flex flex-col justify-center gap-[3px]"
        >
          <div className="font-title text-[13px] tracking-[3px] text-white font-medium leading-[1.25]">
            Dr. Sunday Chizoba
          </div>
          <div className="font-title text-[13px] tracking-[3px] text-white font-medium leading-[1.25]">
            Okafor
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden min-[1101px]:flex items-center gap-[18px] h-full flex-nowrap">
          {navItems.map((item, i) => (
            <motion.div
              key={isNavGroup(item) ? item.label : item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="h-full flex items-center"
            >
              {isNavGroup(item) ? (
                <DesktopDropdown group={item} pathname={pathname} />
              ) : (
                <NavLeafLink link={item} pathname={pathname} />
              )}
            </motion.div>
          ))}
          {adminAuthed ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex items-center"
            >
              <NavLeafLink link={{ label: "Admin", href: "/admin" }} pathname={pathname} />
            </motion.div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <SiteSearch />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex min-[1101px]:hidden flex-col items-center justify-center gap-[5px] p-0 w-10 h-10 shrink-0 z-[2] rounded-full border border-transparent bg-transparent cursor-pointer transition-colors hover:border-accent/40"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  rotate: open && i !== 1 ? (i === 0 ? 45 : -45) : 0,
                  y: open && i !== 1 ? (i === 0 ? 6.5 : -6.5) : 0,
                  opacity: open && i === 1 ? 0 : 1,
                  backgroundColor: open ? "var(--color-accent-light)" : "#ffffff",
                }}
                transition={{ duration: 0.25 }}
                className="block w-[22px] h-[1.5px] bg-white origin-center"
              />
            ))}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[calc(100%+8px)] right-6 left-6 origin-top overflow-hidden rounded-xl border border-accent/25 bg-[rgba(5,13,26,0.98)] py-3 px-2 shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_40px_rgba(74,143,232,0.08)] z-[60] min-[1101px]:hidden block max-h-[min(70vh,560px)] overflow-y-auto"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_100%_0%,var(--color-accent)_0%,transparent_55%)]" />
              {navItems.map((item, i) => (
                <motion.div
                  key={isNavGroup(item) ? item.label : item.href}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.05 }}
                  className="relative"
                >
                  {isNavGroup(item) ? (
                    <MobileGroup group={item} pathname={pathname} onNavigate={closeMobile} />
                  ) : (
                    <NavLeafLink
                      link={item}
                      pathname={pathname}
                      onNavigate={closeMobile}
                      mobile
                    />
                  )}
                </motion.div>
              ))}
              {adminAuthed ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mt-1 border-t border-white/10 pt-1"
                >
                  <NavLeafLink
                    link={{ label: "Admin", href: "/admin" }}
                    pathname={pathname}
                    onNavigate={closeMobile}
                    mobile
                  />
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
