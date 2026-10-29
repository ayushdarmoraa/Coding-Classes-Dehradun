"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { createContext, useContext, useRef, type ReactNode } from "react";

const LoopProgressContext = createContext<MotionValue<number> | null>(null);

function LoopStepBadge({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const progress = useContext(LoopProgressContext);
  const fallbackProgress = useMotionValue(1);
  const reduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.24);
  const end = Math.min(1, start + 0.18);
  const scale = useTransform(
    progress ?? fallbackProgress,
    [start, end],
    reduceMotion ? [1, 1] : [0.6, 1],
  );

  return (
    <motion.span style={{ scale }} className={className}>
      {children}
    </motion.span>
  );
}

export default function LoopProgress({ children }: { children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 75%", "end 65%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <LoopProgressContext.Provider value={scrollYProgress}>
      <div ref={target} className="relative mt-10">
        <div
          className="pointer-events-none absolute inset-x-7 top-[1.65rem] hidden h-0.5 bg-white/15 lg:block"
          aria-hidden="true"
        >
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-[#4b3fd8] to-[#2fa8f0]"
            style={{ scaleX: reduceMotion ? 1 : scaleX }}
          />
        </div>
        {children}
      </div>
    </LoopProgressContext.Provider>
  );
}

export { LoopStepBadge };
