import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Button from "@/components/ui/Button";
import { trackEnrollClick } from "@/lib/analytics";
import Card from "@/components/ui/Card";

// Normalize base URL → https + apex (no trailing slash)
const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");
const APEX = BASE.replace(/^https:\/\/www\./, "https://");
const CANON = `${APEX}/online-courses/full-stack`;

// ---- Page Metadata ----
export const metadata: Metadata = {
  title: "Online Full-Stack Development (MERN) in India (Live + Projects)",
  description:
    "Live online Full-Stack (MERN) for India-wide learners. Small batches, projects, recordings & mentor support. 6 months · ₹25,000 · Placement help.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Online Full-Stack Development (MERN) in India (Live + Projects)",
    description:
      "Live online Full-Stack (MERN) for India-wide learners. Small batches, projects, recordings & mentor support. 6 months · ₹25,000 · Placement help.",
    url: CANON,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Full-Stack Development (MERN) in India (Live + Projects)",
    description:
      "Live online Full-Stack (MERN) for India-wide learners. Small batches, projects, recordings & mentor support. 6 months · ₹25,000 · Placement help.",
  },
};

export default function OnlineFullStackPage() {
  // JSON-LD: Course + CourseInstance (Online) and Breadcrumbs
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Online Full-Stack Development (MERN)",
    description:
      "Live online, small batches, weekly projects, recordings, mentor hours, and placement support.",
    provider: {
      "@type": "Organization",
      name: "Doon Coding Academy",
      url: APEX,
    },
    offers: {
      "@type": "Offer",
      price: "25000",
      priceCurrency: "INR",
      url: CANON,
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      startDate: "2025-01-01", // optional placeholder; remove or update when you have real dates
      instructor: { "@type": "Person", name: "Ayush Darmora" },
    },
  };

  // breadcrumbs injected via inline <script> at the bottom

  return (
    <div className="min-h-screen">
      {/* H1 — required: Online + India + value proposition */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Online Full-Stack Development (MERN) in India
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Live, cohort-based training with <strong>projects</strong>, <strong>recordings</strong>,
            and <strong>mentor hours</strong>. Small batches, hands-on reviews, and placement
            support—fully online. {" "}
            <Link href="/courses/full-stack" className="underline text-yellow-200 hover:text-white">
              Prefer on-campus? See Dehradun Full-Stack
            </Link>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              href="/contact"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500"
              event="cta_enroll_click"
              eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'hero_primary' }}
            >
              Talk to a Mentor
            </Button>
            <Button
              href="/courses/full-stack"
              size="lg"
              variant="secondary"
              event="cta_enroll_click"
              eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'hero_secondary_oncampus' }}
            >
              Prefer On-Campus (Dehradun)?
            </Button>
          </div>
          <div className="mt-6 text-sm text-blue-200">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 mr-2">Duration: 6 months</span>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 mr-2">Fees: ₹25,000</span>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10">Placement Rate: 85%</span>
          </div>
        </div>
      </section>

      {/* Key Outcomes / What you learn */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Outcomes</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Build and deploy full MERN apps (Auth, CRUD, payments).</li>
              <li>Use modern JS/TS, React, routing, state & API patterns.</li>
              <li>Git/GitHub workflow, CI basics, and production hygiene.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Delivery (Online)</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Live sessions + full recordings for every class.</li>
              <li>Weekly mentor hours & project reviews.</li>
              <li>Private community & doubt support between classes.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Placement Support</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Portfolio & resume polishing with real project artifacts.</li>
              <li>Mock interviews & DSA refreshers.</li>
              <li>Referrals where relevant; interview prep plan.</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* High-level syllabus snapshot */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Syllabus Overview</h3>
            <ol className="list-decimal ml-5 text-gray-700 space-y-1">
              <li>HTML/CSS, Tailwind, modern JS & TypeScript basics</li>
              <li>React, Hooks, routing, state, forms, data fetching</li>
              <li>Node.js, Express, REST APIs, MongoDB (Mongoose)</li>
              <li>Auth, sessions/JWT, role-based access, validation</li>
              <li>Payments, file uploads, emails, background jobs</li>
              <li>Deployment, envs, logs, perf & production checklists</li>
            </ol>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Cohort & Tools</h3>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Live on Zoom/Meet; repo reviews on GitHub.</li>
              <li>Issue-driven sprints; weekly demos.</li>
              <li>Recordings, notes & tasks inside the cohort space.</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Button
                href="/contact"
                event="cta_enroll_click"
                eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'cohort_card_primary' }}
              >
                Enroll / Ask Questions
              </Button>
              <Button
                href="/faq"
                variant="ghost"
                event="cta_enroll_click"
                eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'cohort_card_faq' }}
              >
                See FAQs
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 text-gray-700">
          <p>
            Near Dehradun and prefer in-person?{" "}
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
              See the on-campus Full-Stack program
            </Link>
            .
          </p>
          <p className="mt-3 text-sm">
            Want city options? <Link href="/locations" className="text-blue-700 underline">Browse locations</Link>.
          </p>
        </div>
      </section>

      {/* JSON-LD (Course) */}
      <Script
        id="jsonld-course-online-fullstack"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <script
        id="breadcrumbs-online-courses-full-stack"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://dooncodingacademy.in" },
              { "@type": "ListItem", position: 2, name: "Online Courses", item: "https://dooncodingacademy.in/online-courses" },
              { "@type": "ListItem", position: 3, name: "Online Full-Stack Development (MERN) in India", item: "https://dooncodingacademy.in/online-courses/full-stack" }
            ]
          })
        }}
      />
    </div>
  );
}
