"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

// const facts = [
//   { label: "License", value: "Professional Engineer (PE)" }
// ];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="about"
      ref={ref}
      className="section-pad bg-off-white relative overflow-hidden"
    >
      {/* BG accent */}
      <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-[rgba(10,22,40,0.04)] to-transparent pointer-events-none" />

      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center min-w-0"
          >
            <div className="relative w-full max-w-[min(360px,100%)] pb-7 pl-4 md:pb-14 md:pl-7">
              {/* Frame */}
              <div className="absolute top-2.5 left-5 w-[calc(100%-8px)] md:left-[38px] md:w-full md:max-w-[360px] aspect-[360/480] border border-accent/25 z-0" />
              {/* Main */}
              <div className="img-zoom relative w-full aspect-[360/480] z-[1]">
                <Image
                  src="/images/headshot.jpg"
                  alt="Dr. Sunday Okafor"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="min-w-0 break-words"
            initial={{ opacity: 0, x: 48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className="section-rule" />
              <span className="font-title text-[10px] tracking-[4px] uppercase text-black">
                About
              </span>
            </div>
            <h2 className="font-display font-light text-[clamp(26px,7vw,36px)] md:text-[clamp(28px,4vw,52px)] text-black leading-[1.2] mb-6">
              A Civil Engineer Dedicated to the Future of Safe,{" "}
              <em className="font-semibold text-accent">
                Smart Transportation Infrastructure.
              </em>
            </h2>
            <div className="flex flex-col gap-4 mb-8">
              <p className="font-display text-[16px] md:text-[20px] leading-[1.75] text-text-secondary font-normal">
                Dr. Sunday Okafor is a licensed Professional Engineer operating
                at the critical nexus of traffic safety analytics, connected
                vehicle systems, and complex infrastructure delivery. His work
                is driven by a singular mission: to use data to make our roads
                safer, more efficient, and more equitable for everyone.
              </p>
              <p className="text-[15px] leading-[1.8] text-text-muted">
                A distinguished scholar, Dr. Okafor earned his Master’s and
                Doctor of Philosophy (Ph.D.) in Civil Engineering from The
                University of Alabama, where his research as a Graduate Research
                Assistant at the Alabama Transportation Institute (ATI)—a
                premier national hub for transit innovation—focused on advanced
                crash analytics and predictive modeling. He was awarded his
                Master of Science (M.Sc.) in Civil Engineering from Nottingham
                Trent University, UK, as a prestigious Commonwealth Shared
                Scholar, a testament to his academic excellence and global
                potential. He holds a Bachelor of Science (B.Sc.) from FUNAAB,
                Nigeria.
              </p>
              <p className="text-[15px] leading-[1.8] text-text-muted">
                Today, Dr. Okafor brings this academic rigor to the corporate
                sector as a Project Engineer at Garver, where he designs safer,
                more efficient roadway networks for communities across the
                United States. An active member of ITE, he is also a dedicated
                community builder, having previously served as President of the
                African Students Association, Vice President ITE Student Chapter,
                Graduate School Ambassador, and International Peer Advisory
                Council Member at The University of Alabama.
              </p>
              <p className="text-[15px] leading-[1.8] text-text-muted">
                Dr. Okafor is happily married to Maryjane, and they are
                dedicated to building a strong relationship that will honor God
                and serve as role model to the younger generation.
              </p>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="h-px bg-gradient-to-r from-navy-800 to-transparent opacity-15 mb-7 origin-left"
            />

            {/* <div className="grid grid-cols-1 gap-x-6 gap-y-3">
              {facts.map(f => (
                <div key={f.label} className="min-w-0">
                  <div className="font-title text-[9px] tracking-[2px] uppercase text-navy-500 opacity-50 mb-0.5">{f.label}</div>
                  <div className="text-[13px] font-medium text-navy-800">{f.value}</div>
                </div>
              ))}
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
