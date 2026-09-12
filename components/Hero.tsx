"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const words = [
  ["Transportation", "Engineer."],
  ["Researcher."],
  ["Leader."],
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative flex h-screen min-h-[700px] items-end overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ scale }}>
        <Image
          src="/images/hero-picture.jpeg"
          alt="Dr. Sunday Okafor"
          fill
          priority
          className="object-cover object-[center_18%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,13,26,0.92)_0%,rgba(5,13,26,0.65)_50%,rgba(5,13,26,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,1)_0%,rgba(5,13,26,0.3)_40%,transparent_70%)]" />
      </motion.div>

      <motion.div className="relative z-10 w-full" style={{ y: textY, opacity }}>
        <div className="container pb-[72px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-5 flex items-center gap-3.5"
          >
            <div className="h-px w-9 shrink-0 bg-accent/80" />
          </motion.div>

          <div className="mb-[22px] max-w-[920px] overflow-hidden">
            <motion.h1
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 font-display text-[clamp(28px,4.6vw,56px)] font-light italic leading-[1.2] text-white"
            >
              <span className="text-accent-light" aria-hidden>
                &ldquo;
              </span>
              Do not let the difficult days deter you from moving forward, keep going everyday
              <span className="text-accent-light" aria-hidden>
                &rdquo;
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mb-8 flex items-center gap-3.5"
          >
            <div className="relative h-11 min-w-[220px] overflow-hidden">
              {words.map((lines, i) => (
                <motion.span
                  key={lines.join(" ")}
                  initial={{ y: 44, opacity: 0 }}
                  animate={{ y: [44, 0, 0, -44], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3,
                    delay: i * 3 + 1.2,
                    repeat: Infinity,
                    repeatDelay: (words.length - 1) * 3,
                  }}
                  className={`flex h-11 flex-col justify-center whitespace-nowrap font-title text-[clamp(14px,1.5vw,17px)] uppercase leading-[1.25] tracking-[3px] text-accent-light ${
                    i === 0 ? "relative" : "absolute left-0 top-0"
                  }`}
                >
                  {lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-9 right-12 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-title text-[9px] tracking-[3px] text-white/40 [writing-mode:vertical-rl]">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-[52px] w-px bg-[linear-gradient(to_bottom,var(--color-accent),transparent)]"
        />
      </motion.div>
    </section>
  );
}
