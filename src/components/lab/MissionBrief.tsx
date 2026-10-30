import { getCourseBySlug } from "@/lib/courses";
import type { LabChallenge } from "@/lib/lab/types";
import type { LabChallengeContext } from "@/lib/analytics";
import { LabTrackedLink } from "./LabTrackedLink";

export default function MissionBrief({
  challenge,
  analyticsContext,
}: {
  challenge: LabChallenge;
  analyticsContext: LabChallengeContext;
}) {
  const relatedCourse = challenge.relatedCourseSlug
    ? getCourseBySlug(challenge.relatedCourseSlug)
    : undefined;

  return (
    <article className="surface-card h-full p-5 sm:p-7">
      <div className="flex flex-wrap gap-2 text-sm text-ink-2">
        <span className="pill bg-tint-lavender px-3 py-1">
          {challenge.difficulty}
        </span>
        <span className="pill bg-tint-blue px-3 py-1">
          {challenge.estimatedMinutes.minimum}–
          {challenge.estimatedMinutes.maximum} minutes
        </span>
        <span className="pill bg-tint-mint px-3 py-1">
          JavaScript
        </span>
        {challenge.tags.map((tag, index) => (
          <span
            key={tag}
            className={`pill px-3 py-1 ${index % 2 === 0 ? "bg-tint-peach" : "bg-tint-blue"}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <section aria-labelledby="mission-scenario-heading" className="mt-7 rounded-dca-sm bg-tint-blue p-4 sm:p-5">
        <h2
          id="mission-scenario-heading"
          className="text-xl font-semibold text-ink"
        >
          Mission scenario
        </h2>
        {challenge.mission.scenario.map((paragraph) => (
          <p key={paragraph} className="mt-3 leading-7 text-ink-2">
            {paragraph}
          </p>
        ))}
      </section>

      <section aria-labelledby="mission-objective-heading" className="mt-5 rounded-dca-sm bg-tint-lavender p-4 sm:p-5">
        <h2
          id="mission-objective-heading"
          className="text-xl font-semibold text-ink"
        >
          Your objective
        </h2>
        <p className="mt-3 leading-7 text-ink-2">
          {challenge.mission.objective}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-ink-2">
          {challenge.mission.expectedBehavior.map((behavior) => (
            <li key={behavior}>{behavior}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 border-t border-brand-soft pt-5 text-sm leading-6 text-ink-2">
        Your solution is evaluated against fixed mission tests in a browser
        worker. Learner code is not sent to the server. This client-side
        restriction is not a general-purpose security sandbox.
      </p>

      {relatedCourse && (
        <p className="mt-4 text-sm text-ink-2">
          Want to explore the related course?{" "}
          <LabTrackedLink
            event="course"
            context={analyticsContext}
            relatedCourseSlug={relatedCourse.slug}
            href={`/courses/${relatedCourse.slug}`}
            className="font-semibold text-brand-dark underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {relatedCourse.shortTitle}
          </LabTrackedLink>
        </p>
      )}
    </article>
  );
}
