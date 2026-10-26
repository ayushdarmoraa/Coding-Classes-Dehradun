import type { Metadata } from "next";
import Link from "next/link";
import CourseCatalog from "@/components/features/CourseCatalog";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import { getCourses } from "@/lib/courses";
import { getChallengePath } from "@/lib/lab/challenge-utils";
import { getPublishedChallenges } from "@/lib/lab/challenges";
import { SITE } from "@/lib/site-config";

const courseHubFaqs = [
  {
    q: "Do I need prior coding experience?",
    a: "Your starting learning stage depends on your current skills and goals, and progression can follow your pace.",
  },
  {
    q: "Are payment plans available?",
    a: "Course pricing includes monthly rates and package rates. See each course page for its current pricing.",
  },
  {
    q: "Does every course include project work?",
    a: "Project details are not listed for every course. Contact DCA to confirm whether a specific course includes project work.",
  },
  {
    q: "How do I decide which course is right for me?",
    a: "Compare the course curriculum, duration, and fees, or contact us with questions.",
  },
] as const;

export const metadata: Metadata = {
  title: "Courses | Doon Coding Academy",
  description:
    "Explore coding, data science, Python, and Java courses at Doon Coding Academy in Dehradun. Compare curriculum, duration, and fees.",
  alternates: { canonical: `${SITE.url}/courses` },
  openGraph: {
    title: "Courses | Doon Coding Academy",
    description:
      "Browse Full-Stack, Data Science, Python, and Java courses in Dehradun. See curriculum, duration, and fees.",
    url: `${SITE.url}/courses`,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary",
    title: "Courses | Doon Coding Academy",
    description:
      "All coding, data science, and programming courses at Doon Coding Academy, Dehradun. Compare curriculum, fees, and outcomes.",
  },
};

export default function CoursesPage() {
  const courses = getCourses();
  const publishedChallenges = getPublishedChallenges().filter((challenge) =>
    courses.some((course) => course.slug === challenge.relatedCourseSlug),
  );
  const relatedChallengeHrefs = publishedChallenges.reduce<
    Record<string, string>
  >((hrefs, challenge) => {
    if (challenge.relatedCourseSlug) {
      hrefs[challenge.relatedCourseSlug] = getChallengePath(challenge);
    }
    return hrefs;
  }, {});

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE.url}/courses#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@type": "WebPage", "@id": `${SITE.url}/`, name: "Home" },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@type": "WebPage", "@id": `${SITE.url}/courses`, name: "Courses" },
      },
    ],
  } as const;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: courseHubFaqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } as const;

  return (
    <main className="min-h-screen bg-gray-50" id="top">
      <script
        id="courses-breadcrumb"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        id="courses-faq-schema"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="mx-auto max-w-6xl px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Explore Coding Courses
        </h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Compare course options, curriculum, duration, and fees to find a
          program that fits your goals.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Need city or online context? Visit our{" "}
          <Link href="/locations" className="text-blue-700 hover:underline">
            Locations
          </Link>{" "}
          page.
        </p>
        <LearningProgressionNote className="mt-3 max-w-3xl text-gray-600" />
      </header>

      <CourseCatalog
        courses={courses}
        relatedChallengeHrefs={relatedChallengeHrefs}
      />

      <section
        className="border-y bg-white py-12"
        aria-labelledby="learning-process-heading"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            id="learning-process-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Course details and learning path
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Compare each course&apos;s listed prerequisites, curriculum, level,
            duration, and fees, then review its curriculum and outcomes on the
            course page. Details about class format, assignments, project
            reviews, and learner support are not listed in this catalog;
            contact us to confirm current details before choosing a course.
          </p>
        </div>
      </section>

      {publishedChallenges.length > 0 && (
        <section
          className="bg-blue-50 py-12"
          aria-labelledby="lab-practice-heading"
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2
              id="lab-practice-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Try a coding challenge in DCA Lab
            </h2>
            <p className="mt-2 max-w-3xl text-gray-700">
              Explore a published coding challenge related to a course and
              practice debugging in the Lab.
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {publishedChallenges.map((challenge) => {
                const course = courses.find(
                  ({ slug }) => slug === challenge.relatedCourseSlug,
                );
                return (
                  <li
                    key={challenge.id}
                    className="rounded-xl bg-white p-5 ring-1 ring-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {challenge.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">
                      {challenge.shortDescription}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Related course: {course?.shortTitle}
                    </p>
                    <Link
                      className="mt-3 inline-flex font-semibold text-blue-700 hover:underline"
                      href={getChallengePath(challenge)}
                    >
                      Try this challenge
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              className="mt-5 inline-flex font-semibold text-blue-700 hover:underline"
              href="/lab"
            >
              Explore DCA Lab
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white py-12" id="faqs">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Course FAQs</h2>
          <p className="mt-1 text-gray-600">
            Quick answers before you pick a track.
          </p>

          <div className="mt-6 space-y-4">
            {courseHubFaqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-gray-50 ring-1 ring-gray-200 open:ring-blue-700/30"
              >
                <summary className="cursor-pointer list-none select-none p-5 text-lg font-semibold">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-700">{item.a}</div>
              </details>
            ))}
          </div>

          <div
            className="mt-8 rounded-2xl border border-blue-700/20 bg-blue-600/5 p-5"
            id="contact-cta"
          >
            <p className="font-semibold text-blue-700">
              Need help choosing the right course?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
              >
                Contact us about choosing a course
              </a>
              <a
                href="https://wa.me/917037905464?text=Hi%2C%20I%20need%20help%20choosing%20a%20course"
                className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
