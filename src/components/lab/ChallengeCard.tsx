import Link from "next/link";
import type { LabChallenge } from "@/lib/lab/types";
import { getChallengePath } from "@/lib/lab/challenge-utils";

export default function ChallengeCard({
  challenge,
}: {
  challenge: LabChallenge;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
      <Link
        href={getChallengePath(challenge)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        Start challenge
      </Link>
    </article>
  );
}
