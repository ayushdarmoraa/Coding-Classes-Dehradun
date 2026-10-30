"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "who-for", label: "Who this is for" },
  { id: "curriculum", label: "Curriculum" },
  { id: "prereq", label: "Prerequisites" },
  { id: "projects", label: "Projects" },
  { id: "learning-works", label: "How learning works" },
  { id: "outcomes", label: "Outcomes" },
  { id: "faqs", label: "FAQs" },
];

export default function CourseTabsNav() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const sectionIds = TABS.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveTab(visible[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Course sections" className="sticky top-16 z-30 mb-8 sm:top-20">
      <div className="rounded-full border border-brand-soft bg-white/90 p-1.5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive ? "text-brand-dark" : "text-ink-2 hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCourseTab"
                    className="absolute inset-0 rounded-full bg-brand-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
