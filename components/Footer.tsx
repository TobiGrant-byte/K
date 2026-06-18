"use client";
import { motion } from "framer-motion";

export default function Footer() {
  const go = (id: string) => document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ background: "var(--navy-900)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 0 40px" }}>
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24, marginBottom: 40 }}>
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
