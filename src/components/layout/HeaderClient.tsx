"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";

export default function HeaderClient() {
  const pathname = usePathname() || "/";
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updateHeader = () => setCompact(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      document.querySelectorAll<HTMLDetailsElement>(".site-header details[open]").forEach((menu) => {
        menu.open = false;
      });
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <Header key={pathname} currentPath={pathname} compact={compact} />;
}
