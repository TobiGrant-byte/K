"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = ["About","Research","Awards","Gallery","Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.querySelector(`#${id.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: "72px",
          background: scrolled ? "rgba(5,13,26,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.4s ease",
          display: "flex", alignItems: "center",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <motion.button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} whileHover={{ opacity: 0.75 }} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "13px", letterSpacing: "3px", color: "#fff", fontWeight: 500 }}>DR. SUNDAY OKAFOR</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "11px", fontStyle: "italic", color: "rgba(255,255,255,0.5)", letterSpacing: "2px" }}>PhD, PE · Civil Engineer</div>
          </motion.button>

          {/* Desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: "36px" }} className="hidden-mobile">
            {links.map((l, i) => (
              <motion.button key={l}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.3 }}
                onClick={() => go(l)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "3px", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", position: "relative" }}
                className="nav-link"
              >
                {l}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              onClick={() => go("Contact")}
              whileHover={{ background: "rgba(255,255,255,0.12)" }}
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", padding: "10px 22px", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.3s" }}
            >
              Get In Touch
            </motion.button>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px" }} className="show-mobile">
            {[0,1,2].map(i => (
              <motion.span key={i} animate={{ rotate: open && i!==1 ? (i===0?45:-45) : 0, y: open && i!==1 ? (i===0?9:0) : 0, opacity: open && i===1 ? 0 : 1 }}
                style={{ display: "block", width: "22px", height: "1px", background: "#fff" }} />
            ))}
          </button>
        </div>
      </motion.nav>

      <style>{`
        @media(max-width:768px){.hidden-mobile{display:none!important}.show-mobile{display:flex!important}}
        .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:rgba(255,255,255,0.6);transition:width 0.3s}
        .nav-link:hover::after{width:100%}
        .nav-link:hover{color:#fff!important}
      `}</style>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "var(--navy-900)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "36px" }}
          >
            {links.map((l, i) => (
              <motion.button key={l} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => go(l)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,6vw,48px)", color: "#fff", fontWeight: 300 }}>
                {l}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
