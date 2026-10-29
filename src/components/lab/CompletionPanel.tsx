import Link from "next/link";
import SkillMap from "./SkillMap";
import type { MissionTestResult } from "@/lib/lab/mission";
import type { LabChallengeContext } from "@/lib/analytics";
import { LabTrackedLink } from "./LabTrackedLink";

type CompletionPanelProps = {
  results: MissionTestResult[] | null;
  highestHintViewed: number;
  completed: boolean;
  analyticsContext: LabChallengeContext;
  onSkillMapViewed: () => void;
};

export default function CompletionPanel({
  results,
  highestHintViewed,
  completed,
  analyticsContext,
  onSkillMapViewed,
}: CompletionPanelProps) {
  if (!completed) return null;

  return (
    <section aria-labelledby="completion-heading" className="space-y-5 rounded-dca-md border border-green-200 bg-tint-mint p-5 shadow-[0_12px_36px_rgba(34,197,94,0.12)] sm:p-6">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Mission complete. All mission tests passed.
      </p>
      <div>
        <h3 id="completion-heading" className="text-2xl font-bold text-ink">Mission Complete</h3>
        <p className="mt-1 font-medium text-ink-2">Great job! You fixed the bug.</p>
      </div>
      <SkillMap
        results={results}
        highestHintViewed={highestHintViewed}
        completed={completed}
        onViewed={onSkillMapViewed}
      />
      <nav aria-label="Next steps" className="flex flex-wrap gap-3">
        <Link
          href="/lab"
          className="pill border border-brand bg-white px-5 py-3 font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Explore DCA Lab
        </Link>
        <LabTrackedLink
          event="course"
          context={analyticsContext}
          relatedCourseSlug="full-stack"
          href="/courses/full-stack"
          className="pill bg-navy-grad px-5 py-3 font-semibold text-white shadow-soft-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Explore Full-Stack Course
        </LabTrackedLink>
        <LabTrackedLink
          event="contact"
          context={analyticsContext}
          href="/contact"
          className="pill border border-brand-soft bg-white/70 px-5 py-3 font-semibold text-ink hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Talk to Mentor
        </LabTrackedLink>
      </nav>
    </section>
  );
}
