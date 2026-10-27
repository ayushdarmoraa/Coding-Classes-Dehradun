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
    <article className="h-full rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap gap-2 text-sm text-gray-700">
        <span className="rounded-full bg-gray-100 px-3 py-1">
          {challenge.difficulty}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1">
          {challenge.estimatedMinutes.minimum}–
          {challenge.estimatedMinutes.maximum} minutes
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1">
          JavaScript
        </span>
        {challenge.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
            {tag}
          </span>
        ))}
      </div>

      <section aria-labelledby="mission-scenario-heading" className="mt-7">
        <h2
          id="mission-scenario-heading"
          className="text-xl font-semibold text-gray-950"
        >
          Mission scenario
        </h2>
        {challenge.mission.scenario.map((paragraph) => (
          <p key={paragraph} className="mt-3 leading-7 text-gray-700">
            {paragraph}
          </p>
        ))}
      </section>

      <section aria-labelledby="mission-objective-heading" className="mt-7">
        <h2
          id="mission-objective-heading"
          className="text-xl font-semibold text-gray-950"
        >
          Your objective
        </h2>
        <p className="mt-3 leading-7 text-gray-700">
          {challenge.mission.objective}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-gray-700">
          {challenge.mission.expectedBehavior.map((behavior) => (
            <li key={behavior}>{behavior}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-600">
        Your solution is evaluated against fixed mission tests in a browser
        worker. Learner code is not sent to the server. This client-side
        restriction is not a general-purpose security sandbox.
      </p>

      {relatedCourse && (
        <p className="mt-4 text-sm text-gray-700">
          Want to explore the related course?{" "}
          <LabTrackedLink
            event="course"
            context={analyticsContext}
            relatedCourseSlug={relatedCourse.slug}
            href={`/courses/${relatedCourse.slug}`}
            className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            {relatedCourse.shortTitle}
          </LabTrackedLink>
        </p>
      )}
    </article>
  );
}
