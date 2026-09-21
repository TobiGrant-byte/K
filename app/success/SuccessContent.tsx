"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PageShell from "@/components/PageShell";

export default function SuccessContent() {
  return (
    <PageShell>
      <main className="section-pad bg-navy-800 relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="accent-wash" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-xl text-center border border-accent/20 px-8 py-16 md:px-12 md:py-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-2xl text-accent-light"
            >
              ✓
            </motion.div>

            <div className="mb-4 flex items-center justify-center gap-3.5">
              <div className="section-rule-light" />
              <span className="eyebrow">Message Received</span>
              <div className="section-rule-light" />
            </div>

            <h1 className="font-display text-[clamp(32px,5vw,48px)] font-light text-white leading-[1.15] mb-5">
              Thank You for <em className="font-semibold">Reaching Out</em>
            </h1>

            <p className="font-display text-lg italic text-white/55 leading-[1.7] mb-10">
              Your message has been sent successfully. Dr. Okafor will respond as soon as possible.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-flex px-8 py-4 bg-accent text-white font-title text-[11px] tracking-[3px] uppercase font-semibold no-underline transition-colors hover:bg-accent-light"
              >
                Back to Home
              </Link>
              <Link
                href="/contact"
                className="inline-flex px-8 py-4 border border-white/30 text-white font-title text-[11px] tracking-[3px] uppercase no-underline transition-colors hover:border-accent/40 hover:bg-white/5"
              >
                Send Another
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </PageShell>
  );
}
