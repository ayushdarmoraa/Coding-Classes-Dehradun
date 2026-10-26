import type { Metadata } from "next";
import Link from "next/link";
import ChallengeCard from "@/components/lab/ChallengeCard";
import { LabPageImpression, LabTrackedLink } from "@/components/lab/LabTrackedLink";
import { getPublishedChallenges } from "@/lib/lab/challenges";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Interactive Coding Challenges & Debugging Practice | DCA Lab",
  description:
    "Practise debugging with beginner-friendly interactive coding challenges in JavaScript at Doon Coding Academy.",
  alternates: { canonical: `${SITE.url}/lab` },
  openGraph: {
    title: "Interactive Coding Challenges | DCA Lab",
    description:
      "Practise debugging with beginner-friendly JavaScript challenges at Doon Coding Academy.",
    url: `${SITE.url}/lab`,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary",
    title: "Interactive Coding Challenges | DCA Lab",
    description:
      "Practise debugging with beginner-friendly JavaScript challenges at Doon Coding Academy.",
  },
};

const processSteps = [
  {
    title: "Read the mission",
    description: "Understand the scenario, objective and expected behaviour.",
  },
  {
    title: "Try a fix",
    description: "Edit the starter function and run the objective checks.",
  },
  {
    title: "Learn from results",
    description: "Review passing and failing cases, then iterate at your pace.",
  },
];

export default function LabPage() {
  const challenges = getPublishedChallenges();
  const categories = Array.from(
    new Set(challenges.flatMap(({ tags }) => tags)),
  );
  const featuredChallenge = challenges[0];
  const featuredAnalyticsContext = featuredChallenge
    ? {
        challengeSlug: featuredChallenge.slug,
        track: featuredChallenge.track,
        difficulty: featuredChallenge.difficulty,
      }
    : undefined;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-14 sm:py-20">
      {featuredAnalyticsContext && (
        <LabPageImpression context={featuredAnalyticsContext} />
      )}
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Doon Coding Academy
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
          DCA Lab
        </h1>
        <p className="mt-5 text-xl leading-8 text-gray-700">
          Learn by solving real coding problems. Debug bugs, fix logic and
          practise software problem solving directly in your browser.
        </p>
        <p className="mt-3 leading-7 text-gray-600">
          Start without signing up: choose a published mission and work through
          its scenario, code and checks.
        </p>
        {featuredChallenge && featuredAnalyticsContext && (
          <LabTrackedLink
            event="start"
            context={featuredAnalyticsContext}
            href={`/lab/${featuredChallenge.track}/${featuredChallenge.slug}`}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Start First Challenge
          </LabTrackedLink>
        )}
      </header>

      <section aria-labelledby="how-lab-works" className="mt-16">
        <h2 id="how-lab-works" className="text-2xl font-bold text-gray-950">
          How the Lab works
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-blue-700">
                Step 0{index + 1}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-gray-950">
                {step.title}
              </h3>
              <p className="mt-2 leading-6 text-gray-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {featuredChallenge && (
        <section aria-labelledby="featured-mission" className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Featured beginner mission
          </p>
          <h2
            id="featured-mission"
            className="mt-2 text-2xl font-bold text-gray-950"
          >
            {featuredChallenge.title}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            {featuredChallenge.shortDescription}
          </p>
        </section>
      )}

      <section aria-labelledby="published-challenges" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              Published challenges
            </p>
            <h2
              id="published-challenges"
              className="mt-2 text-2xl font-bold text-gray-950"
            >
              Choose a mission
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            {challenges.length} {challenges.length === 1 ? "mission" : "missions"} available
          </p>
        </div>
        {challenges.length > 0 ? (
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {challenges.map((challenge) => (
              <li key={challenge.id}>
                <ChallengeCard challenge={challenge} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-gray-700">
            No coding challenges are currently available. Check back later or
            explore the courses below.
          </p>
        )}
      </section>

      {categories.length > 0 && (
        <nav
          aria-labelledby="challenge-categories-heading"
          className="mt-14 rounded-xl bg-slate-50 p-5 sm:p-7"
        >
          <h2
            id="challenge-categories-heading"
            className="text-xl font-bold text-gray-950"
          >
            Browse challenge categories
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => {
              const categoryChallenge = challenges.find(({ tags }) =>
                tags.includes(category),
              );
              if (!categoryChallenge) return null;
              return (
                <li key={category}>
                  <Link
                    href={`/lab/${categoryChallenge.track}/${categoryChallenge.slug}`}
                    className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:border-blue-400 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    {category}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <section
        aria-labelledby="lab-course-connection"
        className="mt-14 flex flex-col gap-5 rounded-xl border border-blue-100 bg-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <h2
            id="lab-course-connection"
            className="text-xl font-bold text-gray-950"
          >
            Want a structured learning path?
          </h2>
          <p className="mt-2 max-w-2xl leading-6 text-gray-700">
            Compare course topics, duration, fees and delivery options before
            choosing what to study next.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-blue-700 bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        >
          Explore courses
        </Link>
      </section>
    </main>
  );
}
