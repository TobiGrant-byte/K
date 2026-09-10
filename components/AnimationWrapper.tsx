"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  threshold?: number;
}

const directionClass = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  none: "",
};

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
  threshold = 0.15,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[800ms] ease-in-out will-change-[opacity,transform] ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClass[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function StaggerChildren({
  children,
  className = "",
  staggerDelay = 120,
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <FadeIn key={i} delay={i * staggerDelay} direction="up">
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
