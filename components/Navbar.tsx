"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { navLinks } from "@/lib/nav";

const links = navLinks;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        <div className="hidden min-[1101px]:flex items-center gap-[22px] h-full flex-nowrap">
          {links.map((l, i) => {
            const active = pathname === l.href;
            return (
              <motion.div key={l.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.2 }}>
                <Link
                  href={l.href}
                  className={`font-title text-xs tracking-[1.5px] uppercase no-underline relative inline-flex items-center h-10 whitespace-nowrap transition-colors duration-300 after:content-[''] after:absolute after:bottom-2 after:left-0 after:h-px after:w-0 after:bg-white/60 after:transition-[width] after:duration-300 hover:after:w-full hover:text-white ${
                    active ? "text-white" : "text-white/75"
                  }`}
                >
                  {l.label}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex min-[1101px]:hidden flex-col items-center justify-center gap-[5px] p-0 w-10 h-10 shrink-0 z-[2] bg-transparent border-none cursor-pointer"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                rotate: open && i !== 1 ? (i === 0 ? 45 : -45) : 0,
                y: open && i !== 1 ? (i === 0 ? 6.5 : -6.5) : 0,
                opacity: open && i === 1 ? 0 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="block w-[22px] h-[1.5px] bg-white origin-center"
            />
          ))}
        </button>

        {/* Mobile dropdown (not fullscreen) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[calc(100%+8px)] right-6 left-6 origin-top bg-[rgba(5,13,26,0.98)] border border-white/12 rounded-xl py-3 px-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)] z-[60] min-[1101px]:hidden block"
            >
              {links.map((l, i) => {
                const active = pathname === l.href;
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i + 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`block py-3.5 px-4 font-display text-[22px] no-underline rounded-lg ${
                        active ? "font-medium text-white" : "font-light text-white/75"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
