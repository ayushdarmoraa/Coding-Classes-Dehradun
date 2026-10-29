"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { createContext, useContext, useRef, type ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LoopProgressContext = createContext<any>(null);

export function useLoopProgress() {
  return useContext(LoopProgressContext);
}

export function LoopStepBadge({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useLoopProgress();
  const shouldReduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.24);
  const end = Math.min(1, start + 0.18);
  const scale = useTransform(
    ctx?.scrollYProgress ?? { get: () => 1 },
    [start, end],
    shouldReduceMotion ? [1, 1] : [0.6, 1]
  );

  return (
    <motion.span style={{ scale }} className={className}>
      {children}
    </motion.span>
  );
}

export default function LoopProgress({ children }: { children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 75%", "end 65%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <LoopProgressContext.Provider value={{ scrollYProgress }}>
      <div ref={target} className="relative mt-10">
        <div className="pointer-events-none absolute inset-x-7 top-[1.65rem] hidden h-0.5 bg-white/15 lg:block" aria-hidden="true">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-[#4b3fd8] to-[#2fa8f0]"
            style={{ scaleX }}
          />
        </div>
        {children}
      </div>
    </LoopProgressContext.Provider>
  );
}
