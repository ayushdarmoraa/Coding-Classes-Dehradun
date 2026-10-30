"use client";

import { motion } from "framer-motion";

export default function CurriculumTimeline({
  items,
  courseId,
}: {
  items: string[];
  courseId: string;
}) {
  return (
    <div className="relative pl-6 sm:pl-8">
      {/* Timeline growing line */}
      <motion.div
        className="absolute bottom-4 left-3 top-4 w-0.5 origin-top bg-gradient-to-b from-brand via-brand-dark to-brand-soft sm:left-4"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
      <ol className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={`${courseId}-curriculum-${index}`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            className="group relative flex items-start gap-4"
          >
            <span
              className="absolute -left-6 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-brand font-mono text-xs font-bold text-white shadow-xs transition-transform duration-300 group-hover:scale-125 sm:-left-8"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="flex-1 rounded-xl border border-brand-soft/80 bg-panel/50 p-3.5 text-sm leading-6 text-ink-2 transition-colors duration-200 group-hover:border-brand/40 group-hover:bg-white">
              {item}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
