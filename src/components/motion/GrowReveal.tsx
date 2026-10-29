"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface GrowRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GrowReveal({
  children,
  className = "",
  delay = 0,
}: GrowRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <motion.div
        className={`grow-reveal-fallback ${className}`}
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.div>
      <noscript>
        <style>{`.grow-reveal-fallback{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </>
  );
}
