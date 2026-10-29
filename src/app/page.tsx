import type { Metadata } from "next";
import Link from "next/link";
import HomeFAQ from "@/components/faq/HomeFAQ";
import CourseCard from "@/components/features/CourseCard";
import ProjectCard from "@/components/projects/ProjectCard";
import AudiencePaths from "@/components/home/AudiencePaths";
import HomeGuidePreview from "@/components/home/HomeGuidePreview";
import HomeHero from "@/components/home/HomeHero";
import IntentCards from "@/components/home/IntentCards";
import LabPreview from "@/components/home/LabPreview";
import LearningLoop from "@/components/home/LearningLoop";
import TrackedLink from "@/components/analytics/TrackedLink";
import { getAllBlogPosts } from "@/lib/blog";
import { getCourses } from "@/lib/courses";
import { getPublishedProjects } from "@/lib/projects";
import { SITE } from "@/lib/site-config";
import { testimonials } from "@/lib/testimonials";

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
  const projects = getPublishedProjects().slice(0, 3);

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
          <p className="section-label">
            Explore courses
          </p>
          <h2
            id="learning-paths-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Choose Your Learning Path
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
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Compare all courses
          </TrackedLink>
        </div>
      </section>

      <LabPreview />

      {projects.length > 0 && (
        <section
          aria-labelledby="home-projects-heading"
          className="bg-panel py-16 sm:py-20"
        >
          <div className="container">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="section-label">
                  Verified project work
                </p>
                <h2
                  id="home-projects-heading"
                  className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                >
                  See What Practical Learning Looks Like
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center font-semibold text-brand-dark underline decoration-blue-300 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                View all projects
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section
        aria-labelledby="practical-learning-heading"
        className="bg-brand-soft-grad py-16 sm:py-20"
      >
        <div className="container">
          <div className="max-w-2xl">
            <p className="section-label">
              Practical learning
            </p>
            <h2
              id="practical-learning-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
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
                className="surface-card p-6"
              >
                <span className="font-mono text-sm font-semibold text-brand">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">
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

      {testimonials.length > 0 && (
        <section
          aria-labelledby="home-testimonials-heading"
          className="container py-16 sm:py-20"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">
                Verified learner stories
              </p>
              <h2
                id="home-testimonials-heading"
                className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
              >
                Verified Testimonials
              </h2>
            </div>
            <Link
              href="/testimonials"
              className="inline-flex min-h-11 items-center font-semibold text-brand-dark underline decoration-blue-300 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Read all testimonials
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <li
                key={`${testimonial.author}-${index}`}
                className="surface-card flex h-full flex-col p-6"
              >
                <blockquote className="flex-1 text-gray-700">
                  <p>{testimonial.text}</p>
                </blockquote>
                <cite className="mt-5 font-semibold not-italic text-ink">
                  {testimonial.author}
                </cite>
              </li>
            ))}
          </ul>
        </section>
      )}

      <HomeFAQ courses={courses} />

      <section
        aria-labelledby="home-final-cta-heading"
        className="bg-navy-grad py-16 text-white sm:py-20"
      >
        <div className="container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="section-label !text-blue-200">
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
