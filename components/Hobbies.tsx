"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const hobbies = [
  // {
  //   title: "Playing Chess",
  //   desc: "A game of strategy, patience, and precision — chess mirrors the way Dr. Okafor approaches every engineering challenge. Always thinking several moves ahead.",
  //   img: "/images/chess 1.jpg",
  //   icon: "♟",
  //   objectPosition: "top",
  // },
  {
    title: "Talking to His Wife",
    desc: "His favourite hobby, his greatest joy, and his most important conversation every day. Behind every great engineer is an even greater partnership.",
    img: "/images/couple.png",
    icon: "♡",
    objectPosition: "center 22%",
  },
];

export default function Hobbies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="hobbies" ref={ref} className="section-pad bg-navy-700 relative overflow-hidden">
      <div className="accent-wash" />

      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px] text-center"
        >
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <div className="section-rule-light" />
            <span className="eyebrow">Beyond the Lab</span>
            <div className="section-rule-light" />
          </div>
          <h2 className="font-display font-light text-[clamp(32px,5vw,58px)] text-white leading-[1.1]">
            The Man Behind the <em className="font-semibold text-accent-light">PhD</em>
          </h2>
          <p className="font-display italic text-lg text-white/45 mt-3.5 max-w-[480px] mx-auto">
            Excellence in engineering begins with a life well-lived outside of it.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-[900px] mx-auto">
          {hobbies.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden cursor-default"
            >
              {/* Image */}
              <div className="img-zoom relative h-80 sm:h-[280px] overflow-hidden">
                <Image
                  src={h.img}
                  alt={h.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: h.objectPosition }}
                  sizes="(max-width: 640px) 100vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,13,26,0.8)] from-0% via-[rgba(5,13,26,0.1)] via-60% to-transparent" />
                {/* Big icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: i * 0.18 + 0.4, type: "spring", stiffness: 200 }}
                  className="absolute top-5 right-5 w-[52px] h-[52px] bg-white/12 backdrop-blur-sm rounded-full flex items-center justify-center text-[22px] border border-white/15"
                >
                  {h.icon}
                </motion.div>
              </div>

              {/* Text */}
              <div className="px-7 pt-7 pb-8">
                <h3 className="font-display text-[26px] font-semibold text-white mb-3 leading-[1.2]">
                  {h.title}
                </h3>
                <p className="text-sm leading-[1.85] text-white/50">
                  {h.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-7" />
          <p className="font-display italic text-xl text-white/35 max-w-[500px] mx-auto">
            &quot;A great mind is nothing without a great heart — and a great partner to share life with.&quot;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
