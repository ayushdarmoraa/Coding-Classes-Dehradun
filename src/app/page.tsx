import type { Metadata } from "next";
import Link from "next/link";
import HomeFAQ from "@/components/faq/HomeFAQ";
import CourseCard from "@/components/features/CourseCard";
import AudiencePaths from "@/components/home/AudiencePaths";
import HomeGuidePreview from "@/components/home/HomeGuidePreview";
import HomeHero from "@/components/home/HomeHero";
import IntentCards from "@/components/home/IntentCards";
import LabPreview from "@/components/home/LabPreview";
import LearningLoop from "@/components/home/LearningLoop";
import TrackedLink from "@/components/analytics/TrackedLink";
import { getAllBlogPosts } from "@/lib/blog";
import { getCourses } from "@/lib/courses";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Coding Courses in Dehradun & Online in India",
  description:
    "Explore practical coding courses, hands-on challenges and learning guides from Doon Coding Academy.",
  alternates: { canonical: `${SITE.url}/` },
  openGraph: {
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Explore practical coding courses, hands-on challenges and learning guides from Doon Coding Academy.",
    url: `${SITE.url}/`,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Explore practical coding courses, hands-on challenges and learning guides from Doon Coding Academy.",
  },
};

const evidencePoints = [
  {
    title: "Clear course details",
    description: "Compare level, duration, fees, curriculum and delivery options.",
  },
  {
    title: "Practice before deciding",
    description: "Try the published discount-calculation mission in the DCA Lab.",
  },
  {
    title: "Choose how to learn",
    description: "Course pages show confirmed On-Campus, Online and Hybrid modes.",
  },
];

export default function HomePage() {
  const courses = getCourses();
  const guides = getAllBlogPosts().slice(0, 3);

  return (
    <main>
      <HomeHero />
      <IntentCards />
      <LearningLoop />

      <section
        aria-labelledby="learning-paths-heading"
        className="container py-16 sm:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Explore courses
          </p>
          <h2
            id="learning-paths-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
          >
            Choose your learning path
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-600">
            Compare the course focus, level, duration, fees and available modes
            before you decide.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              featured={index === 0}
              analyticsLocation="home_course_preview"
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <TrackedLink
            href="/courses"
            event="cta_home_view_all_courses"
            eventParams={{ location: "home_course_preview" }}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Compare all courses
          </TrackedLink>
        </div>
      </section>

      <LabPreview />

      <section
        aria-labelledby="practical-learning-heading"
        className="bg-slate-50 py-16 sm:py-20"
      >
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              Practical learning
            </p>
            <h2
              id="practical-learning-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
            >
              Practical learning you can inspect
            </h2>
            <p className="mt-4 text-lg leading-7 text-gray-600">
              Start with real course information and a working coding mission.
              No outcome promises or learner statistics needed.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {evidencePoints.map((point, index) => (
              <li
                key={point.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <span className="text-sm font-semibold text-blue-700">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-950">
                  {point.title}
                </h3>
                <p className="mt-2 leading-6 text-gray-600">
                  {point.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AudiencePaths />
      <HomeGuidePreview guides={guides} />

      <HomeFAQ courses={courses} />

      <section
        aria-labelledby="home-final-cta-heading"
        className="bg-blue-950 py-16 text-white sm:py-20"
      >
        <div className="container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              Start with a practical step
            </p>
            <h2
              id="home-final-cta-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Start learning by doing.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-blue-100">
              Try the challenge, compare course options, or talk with the
              academy about what you want to learn.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <TrackedLink
              href="/lab/javascript/discount-calculation-bug"
              event="cta_home_try_challenge"
              eventParams={{ location: "home_final_cta" }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-300 px-5 py-3 font-semibold text-blue-950 transition hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
            >
              Try Free Challenge
            </TrackedLink>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/60 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
            >
              Contact the Academy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
