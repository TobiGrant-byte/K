"use client";
import { motion } from "framer-motion";

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

// ── Replace these with Dr. Okafor's real profile URLs ──
const socials = [
  { icon: TwitterIcon,   label: "Twitter",   href: "https://twitter.com/your-handle" },
  { icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/sunday_okafor1/" },
  { icon: LinkedinIcon,  label: "LinkedIn",  href: "https://www.linkedin.com/in/sunday-okafor" },
  { icon: FacebookIcon,  label: "Facebook",  href: "https://www.facebook.com/okafor.sunday.58/" },
];

export default function Footer() {
  const go = (id: string) => document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ background: "var(--navy-900)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 0 40px" }}>
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: "3px", color: "#fff", fontWeight: 500, marginBottom: 4 }}>DR. SUNDAY OKAFOR</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>PhD, PE · Transportation Systems Engineer</div>
          </div>
          <nav style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["about","research","awards","gallery","contact"].map(l => (
              <button key={l} onClick={() => go(l)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "3px", textTransform: "capitalize", color: "rgba(255,255,255,0.4)", transition: "color 0.3s" }}
                onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                {l}
              </button>
            ))}
          </nav>
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 32 }}>
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
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.6)", transition: "all 0.3s",
              }}
            >
              <Icon />
            </motion.a>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 28 }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Dr. Sunday Okafor. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", color: "rgba(255,255,255,0.2)" }}>
            University of Alabama · Alabama Transportation Institute · Garver Engineers
          </p>
        </div>
      </div>
    </footer>
  );
}