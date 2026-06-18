"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type Status = "idle"|"loading"|"success"|"error";

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const update = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading"); setErrMsg("");
    try {
      const r = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { setStatus("success"); setForm({ name:"", email:"", subject:"", message:"" }); }
      else { setStatus("error"); setErrMsg(d.error || "Something went wrong."); }
    } catch { setStatus("error"); setErrMsg("Network error. Please try again."); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
    fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none",
    transition: "border-color 0.3s",
  };

  return (
    <section id="contact" ref={ref} style={{ background: "var(--navy-800)", position: "relative", overflow: "hidden" }} className="section-pad">
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 70% 30%, #fff 0%, transparent 55%)", pointerEvents: "none" }} />

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -36 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.35)" }} />
              <span className="eyebrow">Contact</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,4vw,56px)", color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
              Let's Start a <em style={{ fontWeight: 600 }}>Conversation</em>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 44 }}>
              Whether you're interested in research collaboration, speaking engagements, mentorship, or professional consultation — Dr. Okafor welcomes your message.
            </p>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 36 }} />
            {[
              { label: "Research & Publications", detail: "Academic collaborations & joint research" },
              { label: "Speaking & Conferences", detail: "Keynotes, panels & university talks" },
              { label: "Mentorship", detail: "Graduate students & young engineers" },
              { label: "Professional Enquiries", detail: "Consulting & project partnerships" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 36 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.15 }}>
            {status === "success" ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                style={{ border: "1px solid rgba(255,255,255,0.12)", padding: "60px 40px", textAlign: "center" }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}
                  style={{ width: 56, height: 56, border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 22, color: "#fff" }}>✓</motion.div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 12 }}>Message Sent</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>Thank you for reaching out. Dr. Okafor will respond shortly.<br/>A confirmation has been sent to your email.</p>
                <button onClick={() => setStatus("idle")} style={{ marginTop: 28, padding: "12px 28px", background: "none", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[{ n: "name", ph: "Full name", label: "Name" }, { n: "email", ph: "your@email.com", label: "Email" }].map(f => (
                    <div key={f.n}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{f.label}</div>
                      <input type={f.n === "email" ? "email" : "text"} name={f.n} value={(form as any)[f.n]} onChange={update} required placeholder={f.ph} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.4)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Subject</div>
                  <input type="text" name="subject" value={form.subject} onChange={update} required placeholder="What is this regarding?" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Message</div>
                  <textarea name="message" value={form.message} onChange={update} required rows={6} placeholder="Write your message here..." style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                </div>
                {status === "error" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>{errMsg}</motion.p>
                )}
                <motion.button type="submit" disabled={status === "loading"}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  style={{ padding: "16px", background: "#fff", color: "var(--navy-800)", border: "none", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {status === "loading" ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#contact .container>div{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
