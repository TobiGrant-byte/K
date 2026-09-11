"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";

type Status = "idle" | "loading" | "error";
type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const WEB3FORMS_ACCESS_KEY = "491e7ee9-f5a0-4295-9665-23a72925f4ab";

const inputClass =
  "w-full px-4 py-3.5 bg-white/5 border border-white/12 text-white font-sans text-sm outline-none transition-[border-color] duration-300 focus:border-white/40 disabled:opacity-70";

export default function Contact() {
  const router = useRouter();
  const ref = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const update = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((p) => ({
      ...p,
      [e.target.name as keyof FormState]: e.target.value,
    }));
    if (errMsg) setErrMsg("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: form.subject || "New message to Dr. Okafor ",
          from_name: "Dr. Sunday Okafor Portfolio Form Submission",
          name: form.name,
          email: form.email,
          message: form.message,
          botcheck: formData.get("botcheck") ? true : false,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send your message right now.",
        );
      }

      formRef.current?.reset();
      setForm({ name: "", email: "", subject: "", message: "" });
      router.push("/success");
    } catch (error) {
      setStatus("error");
      setErrMsg(
        error instanceof Error
          ? error.message
          : "Unable to send your message right now.",
      );
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="section-pad bg-navy-800 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_70%_30%,#fff_0%,transparent_55%)] pointer-events-none" />

      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9 }}
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-px bg-white/35" />
              <span className="eyebrow">Contact</span>
            </div>
            <h2 className="font-display font-light text-[clamp(32px,4vw,56px)] text-white leading-[1.1] mb-5">
              Let&apos;s Start a <em className="font-semibold">Conversation</em>
            </h2>
            <p className="font-display text-lg italic text-white/55 leading-[1.7] mb-11">
              Whether you&apos;re interested in research collaboration, speaking
              engagements, mentorship, or professional consultation — Dr. Okafor
              welcomes your message.
            </p>
            <div className="h-px bg-white/[0.08] mb-9" />
            {[
              {
                label: "Research & Publications",
                detail: "Academic collaborations & joint research",
              },
              {
                label: "Speaking & Conferences",
                detail: "Keynotes, panels & university talks",
              },
              {
                label: "Mentorship",
                detail: "Graduate students & young engineers",
              },
              {
                label: "Professional Enquiries",
                detail: "Consulting & project partnerships",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3.5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-1.5" />
                <div>
                  <div className="font-title text-[10px] tracking-[2px] uppercase text-white/50 mb-[3px]">
                    {item.label}
                  </div>
                  <div className="text-[13px] text-white/65">{item.detail}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <form
              ref={formRef}
              onSubmit={submit}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { n: "name" as const, ph: "Full name", label: "Name" },
                    {
                      n: "email" as const,
                      ph: "your@email.com",
                      label: "Email",
                    },
                  ] as const
                ).map((f) => (
                  <div key={f.n}>
                    <div className="font-title text-[9px] tracking-[2px] uppercase text-white/40 mb-2">
                      {f.label}
                    </div>
                    <input
                      type={f.n === "email" ? "email" : "text"}
                      name={f.n}
                      value={form[f.n]}
                      onChange={update}
                      required
                      disabled={status === "loading"}
                      placeholder={f.ph}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="font-title text-[9px] tracking-[2px] uppercase text-white/40 mb-2">
                  Subject
                </div>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={update}
                  required
                  disabled={status === "loading"}
                  placeholder="What is this regarding?"
                  className={inputClass}
                />
              </div>
              <div>
                <div className="font-title text-[9px] tracking-[2px] uppercase text-white/40 mb-2">
                  Message
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={update}
                  required
                  disabled={status === "loading"}
                  rows={6}
                  placeholder="Write your message here..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Web3Forms honeypot — keep hidden */}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 text-[13px]"
                  role="alert"
                >
                  {errMsg}
                </motion.p>
              )}
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`p-4 bg-white text-navy-800 border-none font-title text-[11px] tracking-[3px] uppercase font-semibold cursor-pointer transition-opacity duration-200 ${
                  status === "loading" ? "opacity-60" : "opacity-100"
                }`}
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
