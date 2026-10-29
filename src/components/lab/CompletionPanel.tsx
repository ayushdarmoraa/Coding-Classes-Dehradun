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
    <section aria-labelledby="completion-heading" className="surface-card space-y-5 border-green-300 bg-green-50 p-5">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Mission complete. All mission tests passed.
      </p>
      <div>
        <h3 id="completion-heading" className="text-xl font-bold text-green-950">Mission Complete</h3>
        <p className="mt-1 font-medium text-green-900">Great job! You fixed the bug.</p>
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
          className="rounded-full border border-brand px-5 py-3 font-semibold text-brand-dark hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Explore DCA Lab
        </Link>
        <LabTrackedLink
          event="course"
          context={analyticsContext}
          relatedCourseSlug="full-stack"
          href="/courses/full-stack"
          className="rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Explore Full-Stack Course
        </LabTrackedLink>
        <LabTrackedLink
          event="contact"
          context={analyticsContext}
          href="/contact"
          className="rounded-full border border-gray-400 px-5 py-3 font-semibold text-gray-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Talk to Mentor
        </LabTrackedLink>
      </nav>
    </section>
  );
}
