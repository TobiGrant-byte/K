"use client";
import Link from "next/link";
import { motion } from "framer-motion";

import { navLinks } from "@/lib/nav";

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
);
const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z"/></svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z"/></svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z" />
  </svg>
);

const socials = [
  { icon: TwitterIcon, label: "Twitter", href: "https://x.com/Okafor_SC" },
  { icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/sunday_okafor1/" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "https://www.linkedin.com/in/sunday-okafor" },
  { icon: FacebookIcon, label: "Facebook", href: "https://www.facebook.com/okafor.sunday.58/" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://m.youtube.com/c/SundayOkafor" },
];

const footerLinks = navLinks;

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/5 pt-14 pb-10">
      <div className="container">
        <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
          <div>
            <div className="font-title text-[13px] tracking-[3px] text-white font-medium mb-1">DR. SUNDAY OKAFOR</div>
            <div className="font-display text-[13px] italic text-white/40">PhD, PE ·</div>
          </div>
          <nav className="flex flex-wrap gap-7">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-title text-[10px] tracking-[3px] uppercase text-white/40 no-underline transition-colors duration-300 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex justify-center gap-[18px] mb-8">
          {socials.map(({ icon: Icon, label, href }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)" }}
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/60 transition-all duration-300"
            >
              <Icon />
            </motion.a>
          ))}
        </div>

        <div className="h-px bg-white/5 mb-7" />
        <div className="flex flex-wrap justify-between gap-3">
          <p className="font-title text-[9px] tracking-wide text-white/25">
            © {new Date().getFullYear()} Dr. Sunday Okafor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
