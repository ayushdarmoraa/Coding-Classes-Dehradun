import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Coding Classes in Noida (Online) – Doon Coding Academy",
  description:
    "Learn coding from Noida with DCA’s live online cohorts—mentor-led sessions, projects, and placement support. Our physical campus is in Dehradun.",
  alternates: {
    canonical: "https://dooncodingacademy.in/locations/noida",
  },
  openGraph: {
    title: "Coding Classes in Noida (Online) – Doon Coding Academy",
    description:
      "Live online cohorts for learners in Noida. Mentor support, projects, and career guidance. Visit our Dehradun campus if you’re nearby.",
    url: "https://dooncodingacademy.in/locations/noida",
    type: "website",
    siteName: "Doon Coding Academy",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: "https://dooncodingacademy.in/" },
    { name: "Noida", url: "https://dooncodingacademy.in/locations/noida" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Coding Classes in Noida – Learn Online with Live Mentors
          </h1>
          <p className="mt-3 text-gray-700">
            Based in Noida and want job-ready coding skills? Join{" "}
            <strong>live online cohorts</strong> from Doon Coding Academy (DCA):
            mentor-led sessions, hands-on projects, and career guidance. Our
            <span className="whitespace-nowrap"> </span>
            <Link
              href="/locations/dehradun"
              className="text-blue-700 hover:underline"
            >
              physical campus is in Dehradun
            </Link>
            ; Noida learners study online.
          </p>
        </header>

        {/* Why Noida (online with DCA) */}
        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold">Why learners in Noida pick DCA</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Live, interactive classes + recordings for revision</li>
            <li>Small batches with doubt-clearing and mentor hours</li>
            <li>Project-first curriculum with portfolio outcomes</li>
            <li>Career support: resume, mock interviews, referrals</li>
          </ul>
          <p className="text-gray-700">
            Noida has a strong tech job market across startups and IT services.
            Building real projects and interview readiness makes the difference.
          </p>
        </section>

        {/* Courses slice */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Popular courses for Noida learners</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <Link
                href="/online-courses/full-stack"
                className="text-blue-700 hover:underline"
              >
                Online Full-Stack (MERN)
              </Link>{" "}
              – live cohort, projects, placements
            </li>
            <li>
              <Link
                href="/online-courses/data-science"
                className="text-blue-700 hover:underline"
              >
                Online Data Science
              </Link>{" "}
              – Python, ML, analytics workflows
            </li>
            <li>
              <Link
                href="/online-courses/python"
                className="text-blue-700 hover:underline"
              >
                Online Python
              </Link>{" "}
              – foundations for development & data
            </li>
          </ul>
          <p className="mt-3">
            Browse all{" "}
            <Link
              href="/online-courses"
              className="text-blue-700 hover:underline"
            >
              Online Courses
            </Link>{" "}
            or, if you’re near our city, see{" "}
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
              Full-Stack in Dehradun (On-Campus)
            </Link>
            .
          </p>
        </section>

        {/* Job market context */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Noida job market snapshot</h2>
          <p className="text-gray-700 mt-2">
            The Delhi-NCR corridor (Noida, Greater Noida, Delhi, Gurgaon) has a
            dense mix of SaaS startups, IT services, and product teams. Employers
            expect practical skills, Git discipline, and deployment know-how.
            Our cohorts focus on building &amp; shipping real projects so you can
            interview with confidence.
          </p>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold">Is there a DCA center in Noida?</h3>
              <p className="text-gray-700">
                No. We serve Noida learners via <strong>live online</strong>{" "}
                cohorts. Our only physical campus is in Dehradun.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What’s the class schedule?</h3>
              <p className="text-gray-700">
                Evening slots on weekdays plus weekend mentor hours. Recordings
                are provided for revision.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">
                Do you provide placement support for Noida learners?
              </h3>
              <p className="text-gray-700">
                Yes. You’ll get project reviews, resume prep, mock interviews,
                and guidance on targeting NCR roles.
              </p>
            </div>
          </div>
        </section>

        {/* FAQPage JSON-LD for Noida */}
        <script
          id="faq-noida"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is there a DCA center in Noida?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text:
                      "No. We serve Noida learners via live online cohorts. Our only physical campus is in Dehradun.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What’s the class schedule?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text:
                      "Evening slots on weekdays plus weekend mentor hours. Recordings are provided for revision.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do you provide placement support for Noida learners?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text:
                      "Yes. You’ll get project reviews, resume prep, mock interviews, and guidance on targeting NCR roles.",
                  },
                },
              ],
            }),
          }}
        />

        {/* CTA */}
        <section className="mb-2">
          <div className="flex flex-wrap gap-3">
            <Link href="/online-courses" className="text-blue-700 hover:underline">
              Explore Online Courses
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/blog/live-vs-recorded-coding-classes-india" className="text-blue-700 hover:underline">
              Live vs Recorded: Which is right for you?
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/blog/visit-dca-campus-dehradun-guide" className="text-blue-700 hover:underline">
              Planning a campus visit (Dehradun)?
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/faq" className="text-blue-700 hover:underline">
              Read FAQs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
