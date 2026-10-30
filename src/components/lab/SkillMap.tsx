import { createSkillMap } from "@/lib/lab/skill-map";
import type { MissionTestResult } from "@/lib/lab/mission";
import { observeLabSkillMap } from "@/lib/lab/analytics-session";
import { useEffect, useRef } from "react";

const STATUS_STYLES = {
  Demonstrated: "border border-green-200 bg-tint-mint text-ink",
  Developing: "border border-amber-200 bg-amber-50 text-amber-950",
  "Not demonstrated yet": "border border-brand-soft bg-panel text-ink-2",
} as const;

type SkillMapProps = {
  results: MissionTestResult[] | null;
  highestHintViewed: number;
  completed: boolean;
  onViewed: () => void;
};

export default function SkillMap({
  results,
  highestHintViewed,
  completed,
  onViewed,
}: SkillMapProps) {
  const skills = createSkillMap(results, highestHintViewed, completed);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    return section ? observeLabSkillMap(section, onViewed) : undefined;
  }, [onViewed]);

  return (
    <section ref={sectionRef} aria-labelledby="skill-map-heading" className="rounded-dca-md border border-brand-soft bg-white p-5 sm:p-6">
      <h3 id="skill-map-heading" className="text-xl font-semibold text-ink">Skill Map</h3>
      <ul className="mt-4 space-y-3">
        {skills.map(({ id, label, status }) => (
          <li key={id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ink-2">{label}</span>
            <span className={`pill px-3 py-1 text-sm font-semibold transition-shadow duration-500 ${STATUS_STYLES[status]} ${
              status === "Demonstrated" && completed
                ? "shadow-[0_0_16px_rgba(34,197,94,0.28)]"
                : ""
            }`}>
              {status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-brand-soft pt-4 text-sm leading-6 text-ink-2">
        This Skill Map reflects what you demonstrated in this mission only. It is not a complete assessment of your programming ability or job readiness.
      </p>
    </section>
  );
}
