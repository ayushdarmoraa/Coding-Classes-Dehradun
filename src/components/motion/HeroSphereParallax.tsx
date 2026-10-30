"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

export default function HeroSphereParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, shouldReduceMotion ? 0 : 24]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative z-10 flex items-center justify-center">
      {children}
    </motion.div>
  );
}
