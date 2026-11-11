"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const GRID_UTILITY = /^(?:inline-)?grid(?:$|-(?:cols|rows|flow)(?:-|$))/;

export function hasGridUtilityClass(className: string) {
  return className.split(/\s+/).some((classToken) => {
    const utility = classToken.slice(classToken.lastIndexOf(":") + 1);
    return GRID_UTILITY.test(utility);
  });
}

export default function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/lab/")) return; // never animate the code workspace
    if (!("IntersectionObserver" in window)) return;

    const main = document.querySelector("main");
    if (!main) return;

    const tag = (el: Element, i: number, card = false) => {
      if (el.closest(".cf, .cf-slide")) return;
      if (el.hasAttribute("data-reveal")) return;
      el.setAttribute("data-reveal", "");
      (el as HTMLElement).style.setProperty("--i", String(Math.min(i, 6)));
      if (card) el.setAttribute("data-card", "");
    };

    main.querySelectorAll("h2, h2 + p").forEach((el) => tag(el, 0));
    main.querySelectorAll("[class]").forEach((g) => {
      if (!hasGridUtilityClass(String((g as HTMLElement).className))) return;
      Array.from(g.children).forEach((c, i) => {
        if (/rounded/.test(String((c as HTMLElement).className))) tag(c, i, true);
      });
    });

    document.documentElement.classList.add("js");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    main.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}