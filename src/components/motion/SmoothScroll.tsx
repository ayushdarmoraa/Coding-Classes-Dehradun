"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function SmoothScroll() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduceMotion !== false) return;

    const lenis = new Lenis({ autoRaf: false });
    lenisRef.current = lenis;
    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (!lenisRef.current) window.scrollTo({ top: 0 });
  }, [pathname, reduceMotion]);

  return null;
}
