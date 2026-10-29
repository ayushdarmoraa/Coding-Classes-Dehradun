import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import { MISSION_TESTS } from "@/lib/lab/mission";
import { formatINR } from "@/lib/pricing";

const featuredCase = MISSION_TESTS[0];

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="cd-hero overflow-hidden"
    >
      <div className="container grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div>
          <p className="cd-pill">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-600" />
            Learn. Debug. Build. Prove.
          </p>
          <h1
            id="home-hero-heading"
            className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Learn Coding. Fix Real Problems. Build Real Skills.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Structured coding courses and practical coding challenges to help
            turn concepts into skills you can apply.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/lab/javascript/discount-calculation-bug"
              event="cta_home_try_challenge"
              eventParams={{ location: "home_hero" }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Try a Free Coding Challenge
            </TrackedLink>
            <TrackedLink
              href="/courses"
              event="cta_home_explore_courses"
              eventParams={{ location: "home_hero" }}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-ink transition hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Explore Courses
            </TrackedLink>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex min-h-11 items-center font-semibold text-brand-dark underline decoration-blue-300 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Talk to a Mentor
          </Link>
        </div>

        <article
          aria-labelledby="mission-preview-heading"
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="surface-card rounded-dca-lg p-5 shadow-soft-blue sm:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Code Rescue · JavaScript
                </p>
                <p className="mt-1 text-sm text-gray-500">A DCA Lab mission</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Beginner
              </span>
            </div>
            <h2
              id="mission-preview-heading"
              className="mt-5 text-xl font-bold text-gray-950 sm:text-2xl"
            >
              Fix the Discount Calculation Bug
            </h2>
            <div className="mt-5 rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-auto text-xs text-slate-400">mission preview</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <dt className="text-slate-400">Product price</dt>
                <dd className="text-right font-mono">{formatINR(featuredCase.price)}</dd>
                <dt className="text-slate-400">Discount</dt>
                <dd className="text-right font-mono">{featuredCase.discountPercent}%</dd>
                <dt className="border-t border-slate-700 pt-3 font-medium">Expected</dt>
                <dd className="border-t border-slate-700 pt-3 text-right font-mono font-semibold text-emerald-300">
                  {formatINR(featuredCase.expected)}
                </dd>
                <dt className="font-medium">Current output</dt>
                <dd className="text-right font-mono font-semibold text-rose-300">
                  {formatINR(featuredCase.price)}
                </dd>
              </dl>
            </div>
            <TrackedLink
              href="/lab/javascript/discount-calculation-bug"
              event="cta_home_try_challenge"
              eventParams={{ location: "home_hero_preview" }}
              className="btn-lime mt-5 inline-flex min-h-11 w-full items-center justify-center px-4 py-3 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Start Mission
            </TrackedLink>
          </div>
        </article>
      </div>
    </section>
  );
}
