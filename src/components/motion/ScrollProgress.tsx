"use client";

import { motion, useScroll } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-[#4b3fd8] to-[#2fa8f0]"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
