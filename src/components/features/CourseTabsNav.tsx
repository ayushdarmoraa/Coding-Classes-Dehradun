"use client";

import { useEffect, useState } from "react";

const TABS = [
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
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleSections[0]) {
          setActiveTab(visibleSections[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );

    TABS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Course sections"
      className="sticky top-16 z-30 mb-8"
    >
      <div className="rounded-full border border-blue-100 bg-white/95 p-1.5 shadow-soft-blue backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          {TABS.map(({ id, label }) => {
            const isActive = activeTab === id;

            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveTab(id)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-blue-50 text-blue-950"
                    : "text-blue-800 hover:bg-blue-50 hover:text-blue-950"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
