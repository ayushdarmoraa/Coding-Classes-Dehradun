"use client";

import { useCallback, useRef } from "react";

export default function CourseCardFlip({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle on touch devices; never during render
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: none)").matches) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    const cf = rootRef.current?.querySelector(".cf");
    if (cf) cf.classList.toggle("is-flipped");
  }, []);

  return (
    <div ref={rootRef} onClick={handleClick}>
      {children}
    </div>
  );
}
