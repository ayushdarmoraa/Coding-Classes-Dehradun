import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coding Classes in Mumbai (Online) – Doon Coding Academy",
  description:
    "Learn coding from Mumbai with DCA’s live online cohorts—mentor-led sessions, hands-on projects, and placement support. Our physical campus is in Dehradun.",
  alternates: {
    canonical: "https://dooncodingacademy.in/locations/mumbai",
  },
  openGraph: {
    title: "Coding Classes in Mumbai (Online) – Doon Coding Academy",
    description:
      "Live online cohorts for learners in Mumbai. Mentor support, projects, and career guidance. Visit our Dehradun campus if you’re nearby.",
    url: "https://dooncodingacademy.in/locations/mumbai",
    type: "website",
    siteName: "Doon Coding Academy",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://dooncodingacademy.in/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mumbai",
        item: "https://dooncodingacademy.in/locations/mumbai",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Coding Classes in Mumbai – Learn Online with Live Mentors
          </h1>
          <p className="mt-3 text-gray-700">
            In Mumbai and want job-ready coding skills? Join {""}
            <strong>live online cohorts</strong> from Doon Coding Academy (DCA):
            mentor-led sessions, hands-on projects, and career guidance. Our {""}
            <Link
              href="/locations/dehradun"
              className="text-blue-700 hover:underline"
            >
              physical campus is in Dehradun
            </Link>
            ; Mumbai learners study online.
          </p>
        </header>

        {/* Why Mumbai (online with DCA) */}
        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold">Why learners in Mumbai pick DCA</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Live, interactive classes + recordings for revision</li>
            <li>Small batches with doubt-clearing and mentor hours</li>
            <li>Project-first curriculum and portfolio building</li>
            <li>Career support: resume, mock interviews, referrals</li>
          </ul>
          <p className="text-gray-700">
            Mumbai’s tech, finance, and media ecosystem rewards practical skills:
            Git, deployments, data handling, and teamwork. We focus on building &
            shipping, so you can interview with confidence.
          </p>
        </section>

        {/* Courses slice (Full-Stack, Data Science, Python) */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Popular courses for Mumbai learners</h2>
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
            Browse all {""}
            <Link
              href="/online-courses"
              className="text-blue-700 hover:underline"
            >
              Online Courses
            </Link>{" "}
            or, if you’re near our city, see {""}
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
              Full-Stack in Dehradun (On-Campus)
            </Link>
            .
          </p>
        </section>

        {/* Job market context */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Mumbai job market snapshot</h2>
          <p className="text-gray-700 mt-2">
            From fintech and media tech to product startups and IT services,
            employers in Mumbai look for applied skills and portfolio proof.
            Our cohorts mirror workplace workflows so you’re ready on day one.
          </p>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold">Is there a DCA center in Mumbai?</h3>
              <p className="text-gray-700">
                No. We serve Mumbai learners via <strong>live online</strong>{" "}
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
                Do you provide placement support for Mumbai learners?
              </h3>
              <p className="text-gray-700">
                Yes. You’ll get project reviews, resume prep, mock interviews,
                and targeted guidance for Mumbai roles.
              </p>
            </div>
          </div>
        </section>

        {/* CTA (reuse Noida/Bangalore links) */}
        <section className="mb-2">
          <div className="flex flex-wrap gap-3">
            <Link href="/online-courses" className="text-blue-700 hover:underline">
              Explore Online Courses
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/blog/live-vs-recorded-coding-classes-india"
              className="text-blue-700 hover:underline"
            >
              Live vs Recorded: Which is right for you?
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/blog/visit-dca-campus-dehradun-guide"
              className="text-blue-700 hover:underline"
            >
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
