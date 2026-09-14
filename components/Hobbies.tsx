"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const hobbies = [
  {
    title: "Talking with His Wife",
    desc: "His favourite thing to do is engaging in daily gists with his Achalaugo, Maryjane — the conversations that ground every day.",
    img: "/images/couple.png",
    icon: "♡",
    objectPosition: "center 22%",
  },
  {
    title: "Playing Chess",
    desc: "He also enjoys playing chess — a quiet contest of patience, foresight, and calm under pressure.",
    img: "/images/chess-img.jpg",
    icon: "♟",
    objectPosition: "center center",
  },
  {
    title: "Watching Football",
    desc: "And when the whistle blows, you’ll find him watching football — the beautiful game, shared with the same easy joy.",
    img: "/images/soccer-image.jpg",
    icon: "◎",
    objectPosition: "center center",
  },
];

export default function Hobbies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="hobbies" ref={ref} className="section-pad relative overflow-hidden bg-navy-700">
      <div className="accent-wash" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px] text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3.5">
            <div className="section-rule-light" />
            <span className="eyebrow">Away From Work</span>
            <div className="section-rule-light" />
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            The Man Behind the <em className="font-semibold text-accent-light">PhD</em>
          </h2>
          <p className="mx-auto mt-3.5 max-w-[480px] font-display text-lg italic text-white/45">
            Excellence in engineering begins with a life well-lived outside of it.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {hobbies.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="cursor-default overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"
            >
              <div className="img-zoom relative h-72 overflow-hidden sm:h-[260px]">
                <Image
                  src={h.img}
                  alt={h.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: h.objectPosition }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,13,26,0.8)] from-0% via-[rgba(5,13,26,0.1)] via-60% to-transparent" />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: i * 0.12 + 0.35, type: "spring", stiffness: 200 }}
                  className="absolute right-5 top-5 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/15 bg-white/12 text-[22px] backdrop-blur-sm"
                >
                  {h.icon}
                </motion.div>
              </div>

              <div className="px-7 pb-8 pt-7">
                <h3 className="mb-3 font-display text-[24px] font-semibold leading-[1.2] text-white">
                  {h.title}
                </h3>
                <p className="text-sm leading-[1.85] text-white/50">{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="mx-auto mb-7 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <p className="mx-auto max-w-[500px] font-display text-xl italic text-white/35">
            &quot;A great mind is nothing without a great heart — and a great partner to share life
            with.&quot;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
