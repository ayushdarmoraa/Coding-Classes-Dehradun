import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import TechSphere from "@/components/motion/TechSphere";
import HeroSphereParallax from "@/components/motion/HeroSphereParallax";
import { techSphereItems } from "@/components/home/techSphereItems";
import { getCourses } from "@/lib/courses";
import { MISSION_TESTS } from "@/lib/lab/mission";
import { formatINR } from "@/lib/pricing";

const featuredCase = MISSION_TESTS[0];
const featuredCourses = getCourses();

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-bg-grid"
    >
      <div
        className="pointer-events-none absolute right-8 top-24 h-28 w-28 rounded-full bg-tint-lavender/60 blur-2xl"
        aria-hidden="true"
      />
      {/* Animated gradient blobs */}
      <div className="blob -left-20 top-1/4 h-[320px] w-[320px] bg-[#2F7BF0]" aria-hidden="true" />
      <div className="blob right-10 top-10 h-[420px] w-[420px] bg-[#7C4DFF]" style={{ animationDelay: '-6s' }} aria-hidden="true" />
      <div className="blob bottom-10 left-1/3 h-[280px] w-[280px] bg-[#2FA8F0]" style={{ animationDelay: '-11s' }} aria-hidden="true" />
      <div className="container relative pt-10 pb-16 lg:pt-14 lg:pb-24">
        {/* Top row */}
        <div className="grid min-h-[560px] items-center gap-10 lg:grid-cols-2 lg:gap-16 lg:min-h-[640px]">
          <div>
            <p className="section-label hero-stagger-1">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
                Learn. Debug. Build. Prove.
              </span>
            </p>
            <h1
              id="home-hero-heading"
              className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl hero-stagger-2"
            >
              Learn Coding. Fix <span className="text-shimmer">Real Problems.</span> Build Real Skills.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2 hero-stagger-3">
              Structured coding courses and practical coding challenges to help
              turn concepts into skills you can apply.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row hero-stagger-4">
              <TrackedLink
                href="/lab/javascript/discount-calculation-bug"
                event="cta_home_try_challenge"
                eventParams={{ location: "home_hero" }}
                className="btn-shine group inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-5 py-3 font-semibold text-white shadow-soft-blue transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Try a Free Coding Challenge
                <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </TrackedLink>
              <TrackedLink
                href="/courses"
                event="cta_home_explore_courses"
                eventParams={{ location: "home_hero" }}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand bg-white px-5 py-3 font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Explore Courses
              </TrackedLink>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-brand-dark underline decoration-brand/40 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand hero-stagger-5"
            >
              Talk to a Mentor
            </Link>
          </div>

          <HeroSphereParallax>
            <div
              data-testid="home-tech-sphere"
              className="flex items-center justify-center"
            >
              <div className="md:hidden">
                <TechSphere items={techSphereItems} size={260} />
              </div>
              <div className="hidden md:block lg:hidden">
                <TechSphere items={techSphereItems} size={300} />
              </div>
              <div className="hidden lg:block">
                <TechSphere items={techSphereItems} size={400} />
              </div>
            </div>
          </HeroSphereParallax>
        </div>

        {/* Second row */}
        <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2 lg:-mt-2 lg:gap-6">
          <article
            aria-labelledby="mission-preview-heading"
            className="hero-card-scale-2 float flex w-full flex-col rounded-dca-md bg-violet-grad p-5 text-white shadow-soft-blue sm:p-7"
            style={{ animationDelay: "-3s" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  Code Rescue · JavaScript
                </p>
                <p className="mt-1 text-sm text-white/70">A DCA Lab mission</p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                Beginner
              </span>
            </div>
            <h2
              id="mission-preview-heading"
              className="mt-5 text-xl font-bold text-white sm:text-2xl"
            >
              Fix the Discount Calculation Bug
            </h2>
            <div className="mt-5 rounded-xl border border-white/15 bg-[#0a1230]/60 p-4 text-sm">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-auto text-xs text-white/60">mission preview</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <dt className="text-white/65">Product price</dt>
                <dd className="text-right font-mono">{formatINR(featuredCase.price)}</dd>
                <dt className="text-white/65">Discount</dt>
                <dd className="text-right font-mono">{featuredCase.discountPercent}%</dd>
                <dt className="border-t border-white/20 pt-3 font-medium">Expected</dt>
                <dd className="border-t border-white/20 pt-3 text-right font-mono font-semibold text-emerald-200">
                  {formatINR(featuredCase.expected)}
                </dd>
                <dt className="font-medium">Current output</dt>
                <dd className="text-right font-mono font-semibold text-rose-200">
                  {formatINR(featuredCase.price)}
                </dd>
              </dl>
            </div>
            <TrackedLink
              href="/lab/javascript/discount-calculation-bug"
              event="cta_home_try_challenge"
              eventParams={{ location: "home_hero_preview" }}
              className="btn-shine mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e1065] mt-auto"
            >
              Start Mission
            </TrackedLink>
          </article>
          <article className="hero-card-scale-1 float flex flex-col rounded-dca-md bg-navy-grad p-5 text-white shadow-soft-blue sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-white sm:text-2xl">Explore courses</h2>
              <span aria-hidden="true" className="text-2xl text-white/70">&lt;/&gt;</span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  role="group"
                  aria-label={`${course.shortTitle} delivery options`}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-white">{course.shortTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-white/80">
                    {course.modeStatus === "confirmed"
                      ? `Confirmed modes: ${course.modes.join(", ")}`
                      : "Delivery availability not confirmed"}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/courses"
              className="btn-shine mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1a38] mt-auto"
            >
              Explore Courses
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
