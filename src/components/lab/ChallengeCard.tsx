import type { LabChallenge } from "@/lib/lab/types";
import { getChallengePath } from "@/lib/lab/challenge-utils";
import { LabTrackedLink } from "./LabTrackedLink";

export default function ChallengeCard({
  challenge,
}: {
  challenge: LabChallenge;
}) {
  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="pill border border-brand-soft bg-tint-blue px-3 py-1 text-brand-dark">
          {challenge.difficulty}
        </span>
        <span className="pill bg-tint-lavender px-3 py-1 text-ink-2">
          {challenge.estimatedMinutes.minimum}–
          {challenge.estimatedMinutes.maximum} min
        </span>
        <span className="pill bg-tint-mint px-3 py-1 text-ink-2">
          {challenge.language === "javascript" ? "JavaScript" : challenge.language}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-ink">
        {challenge.title}
      </h3>
      <p className="mt-2 flex-1 leading-6 text-ink-2">
        {challenge.shortDescription}
      </p>
      <ul aria-label="Challenge topics" className="mt-4 flex flex-wrap gap-2">
        {challenge.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-brand-soft bg-white px-3 py-1 text-xs font-medium text-ink-2"
          >
            {tag}
          </li>
        ))}
      </ul>
      <LabTrackedLink
        event="start"
        context={{
          challengeSlug: challenge.slug,
          track: challenge.track,
          difficulty: challenge.difficulty,
        }}
        href={getChallengePath(challenge)}
        className="pill mt-6 inline-flex min-h-11 items-center justify-center bg-navy-grad px-5 py-3 font-semibold text-white shadow-soft-blue transition-transform group-hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Start challenge
      </LabTrackedLink>
    </article>
  );
}
