"use client";

import { motion } from "framer-motion";

export interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
  tabs: TabOption[];
}

export default function Tabs({ activeTab, onChange, tabs }: TabsProps) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap gap-1 rounded-full border border-brand-soft bg-panel p-1"
      role="tablist"
      aria-label="⦿"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`relative isolate z-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === tab.id ? "text-white" : "text-ink-2 hover:text-brand-dark"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {activeTab === tab.id && (
            <motion.span
              className="absolute inset-0 -z-10 rounded-full bg-brand"
              layoutId="dca-tab-indicator"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              aria-hidden="true"
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
