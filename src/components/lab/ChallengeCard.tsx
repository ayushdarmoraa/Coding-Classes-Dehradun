import type { LabChallenge } from "@/lib/lab/types";
import { getChallengePath } from "@/lib/lab/challenge-utils";
import { LabTrackedLink } from "./LabTrackedLink";

export default function ChallengeCard({
  challenge,
}: {
  challenge: LabChallenge;
}) {
  return (
    <article className="surface-card flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-soft-blue">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
          {challenge.difficulty}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
          {challenge.estimatedMinutes.minimum}–
          {challenge.estimatedMinutes.maximum} min
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
          {challenge.language === "javascript" ? "JavaScript" : challenge.language}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-950">
        {challenge.title}
      </h3>
      <p className="mt-2 flex-1 leading-6 text-gray-600">
        {challenge.shortDescription}
      </p>
      <ul aria-label="Challenge topics" className="mt-4 flex flex-wrap gap-2">
        {challenge.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700"
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
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Start challenge
      </LabTrackedLink>
    </article>
  );
}
