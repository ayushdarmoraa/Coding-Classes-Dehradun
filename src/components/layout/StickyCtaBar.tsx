"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function StickyCtaBar() {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 420);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (pathname.startsWith("/lab") || !visible) return null;

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-soft bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(30,70,160,.12)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Link
          href="/lab/javascript/discount-calculation-bug"
          className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Try Free Challenge
        </Link>
        <Link
          href="/contact"
          className="flex-1 rounded-full border border-brand px-4 py-3 text-center text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Talk to Mentor
        </Link>
      </div>
    </nav>
  );
}
