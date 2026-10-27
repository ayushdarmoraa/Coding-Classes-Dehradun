import { createSkillMap } from "@/lib/lab/skill-map";
import type { MissionTestResult } from "@/lib/lab/mission";

const STATUS_STYLES = {
  Demonstrated: "bg-green-100 text-green-900",
  Developing: "bg-amber-100 text-amber-950",
  "Not demonstrated yet": "bg-gray-100 text-gray-800",
} as const;

type SkillMapProps = {
  results: MissionTestResult[] | null;
  highestHintViewed: number;
  completed: boolean;
};

export default function SkillMap({ results, highestHintViewed, completed }: SkillMapProps) {
  const skills = createSkillMap(results, highestHintViewed, completed);

  return (
    <section aria-labelledby="skill-map-heading" className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 id="skill-map-heading" className="text-lg font-semibold text-gray-900">Skill Map</h3>
      <ul className="mt-4 space-y-3">
        {skills.map(({ id, label, status }) => (
          <li key={id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-gray-800">{label}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[status]}`}>
              {status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700">
        This Skill Map reflects what you demonstrated in this mission only. It is not a complete assessment of your programming ability or job readiness.
      </p>
    </section>
  );
}
