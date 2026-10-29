import type { Metadata } from "next";
import Link from "next/link";
import ChallengeCard from "@/components/lab/ChallengeCard";
import { LabPageImpression, LabTrackedLink } from "@/components/lab/LabTrackedLink";
import GrowReveal from "@/components/motion/GrowReveal";
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
    <main className="container mx-auto max-w-8xl px-4 py-10 sm:py-16">
      {featuredAnalyticsContext && (
        <LabPageImpression context={featuredAnalyticsContext} />
      )}
      <header className="surface-card overflow-hidden bg-white/90 p-6 sm:p-10">
        <div className="max-w-4xl">
          <p className="section-label">Doon Coding Academy</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            DCA <span className="text-gradient">Lab</span>
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-ink-2">
            Learn by solving real coding problems. Debug bugs, fix logic and
            practise software problem solving directly in your browser.
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-ink-2">
            Start without signing up: choose a published mission and work through
            its scenario, code and checks.
          </p>
          {featuredChallenge && featuredAnalyticsContext && (
            <LabTrackedLink
              event="start"
              context={featuredAnalyticsContext}
              href={`/lab/${featuredChallenge.track}/${featuredChallenge.slug}`}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-navy-grad px-6 py-3 font-semibold text-white shadow-soft-blue transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Start First Challenge
            </LabTrackedLink>
          )}
        </div>
      </header>

      <section aria-labelledby="how-lab-works" className="mt-16">
        <h2 id="how-lab-works" className="text-3xl font-bold text-ink">
          How the Lab works
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <li
              key={step.title}
              className="h-full"
            >
              <GrowReveal className="h-full" delay={index * 0.06}>
                <div className="surface-card h-full bg-white p-5 sm:p-6">
                  <p className="chip border-transparent bg-tint-blue font-semibold text-brand-dark">
                    Step 0{index + 1}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-6 text-ink-2">
                    {step.description}
                  </p>
                </div>
              </GrowReveal>
            </li>
          ))}
        </ol>
      </section>

      {featuredChallenge && (
        <section
          aria-labelledby="featured-mission"
          className="mt-16 overflow-hidden rounded-dca-lg bg-violet-grad p-6 text-white shadow-soft-blue sm:p-9"
        >
          <GrowReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">
              Featured beginner mission
            </p>
            <h2 id="featured-mission" className="mt-2 text-3xl font-bold text-white">
              {featuredChallenge.title}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/80">
              {featuredChallenge.shortDescription}
            </p>
          </GrowReveal>
        </section>
      )}

      <section aria-labelledby="published-challenges" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Published challenges</p>
            <h2
              id="published-challenges"
              className="mt-3 text-3xl font-bold text-ink"
            >
              Choose a <span className="text-gradient">mission</span>
            </h2>
          </div>
          <p className="text-sm font-medium text-ink-2">
            {challenges.length} {challenges.length === 1 ? "mission" : "missions"} available
          </p>
        </div>
        {challenges.length > 0 ? (
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {challenges.map((challenge, index) => (
              <li key={challenge.id}>
                <GrowReveal delay={index * 0.05} className="h-full">
                  <ChallengeCard challenge={challenge} />
                </GrowReveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="surface-card mt-6 p-5 text-ink-2">
            No coding challenges are currently available. Check back later or
            explore the courses below.
          </p>
        )}
      </section>

      {categories.length > 0 && (
        <nav
          aria-labelledby="challenge-categories-heading"
          className="mt-14 rounded-dca-md border border-brand-soft bg-tint-blue p-5 sm:p-7"
        >
          <h2
            id="challenge-categories-heading"
            className="text-2xl font-bold text-ink"
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
                    className="pill inline-flex min-h-11 items-center border border-brand-soft bg-white px-4 py-2 font-medium text-ink-2 transition-colors hover:border-brand hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
        className="mt-14 flex flex-col gap-5 rounded-dca-lg border border-brand-soft bg-navy-grad p-6 text-white shadow-soft-blue sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <h2
            id="lab-course-connection"
            className="text-2xl font-bold text-white"
          >
            Want a structured learning path?
          </h2>
          <p className="mt-2 max-w-2xl leading-6 text-white/80">
            Compare course topics, duration, fees and delivery options before
            choosing what to study next.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white px-6 py-3 font-semibold text-brand-dark transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
        >
          Explore courses
        </Link>
      </section>
    </main>
  );
}
