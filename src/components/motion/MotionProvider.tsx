"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import ScrollProgress from "./ScrollProgress";
import SmoothScroll from "./SmoothScroll";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <ScrollProgress />
      {children}
    </MotionConfig>
  );
}
