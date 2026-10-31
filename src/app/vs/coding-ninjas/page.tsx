import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getCourseBySlug } from "@/lib/courses";
import { formatCourseDuration, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

const CANON = `${SITE.url}/vs/coding-ninjas`;

export const metadata: Metadata = {
  title: "Doon Coding Academy vs Coding Ninjas",
  description:
    "Compare Doon Coding Academy's published Full-Stack course details with current Coding Ninjas program information from its official site.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Doon Coding Academy vs Coding Ninjas",
    description:
      "Review DCA's current Full-Stack course details and verify Coding Ninjas program information with the provider.",
    url: CANON,
    type: "article",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Doon Coding Academy vs Coding Ninjas",
    description:
      "Compare current course details and check each provider's official program information.",
  },
};

export default function Page() {
  const fullStack = getCourseBySlug("full-stack");
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          Doon Coding Academy vs Coding Ninjas
        </h1>
        <p className="mt-3 text-lg text-gray-700">
          Compare DCA&apos;s published Full-Stack course details with the program
          information available directly from Coding Ninjas. Competitor-specific
          terms are not independently verified here; confirm current details with
          each provider before enrolling.
        </p>
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            <strong>Last reviewed:</strong>{" "}
            <time dateTime="2026-10-31">31 October 2026</time>. This page is
            published by DCA, which offers the compared course; it is not an
            independent ranking.
          </p>
          <p className="mt-2 font-semibold">Sources</p>
          <ul className="list-inside list-disc">
            <li>
              <Link href="/courses/full-stack" className="text-blue-700 underline">
                DCA Full-Stack course details
              </Link>
            </li>
            <li>
              <a
                href="https://www.codingninjas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                Coding Ninjas official site
              </a>
            </li>
          </ul>
        </div>
      </header>

      {/* At-a-glance comparison */}
      <section aria-labelledby="at-a-glance" className="mb-10">
        <h2 id="at-a-glance" className="text-2xl font-semibold mb-4">At a glance</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left font-semibold text-gray-700">
                <th>Aspect</th>
                <th>Doon Coding Academy (DCA)</th>
                <th>Coding Ninjas (General)</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td]:px-4 [&>tr>td]:py-3 divide-y divide-gray-100">
              <tr>
                <td>Format</td>
                <td>See current course details for delivery information.</td>
                <td>Check the selected program&apos;s current official details.</td>
              </tr>
              <tr>
                <td>Focus</td>
                <td>MERN + Gen AI; review the canonical course curriculum and outcomes.</td>
                <td>Review the syllabus for the specific program.</td>
              </tr>
              <tr>
                <td>Batch Size</td>
                <td>Contact DCA for current class-size details.</td>
                <td>Confirm current cohort details with the provider.</td>
              </tr>
              <tr>
                <td>Mentoring</td>
                <td>Contact DCA for current learner-support details.</td>
                <td>Confirm the support model for the selected program.</td>
              </tr>
              <tr>
                <td>Projects</td>
                <td>See the course curriculum and listed outcomes.</td>
                <td>Check the selected program&apos;s curriculum.</td>
              </tr>
              <tr>
                <td>Duration</td>
                <td>Full-Stack: {fullStack ? formatCourseDuration(fullStack.duration) : "See course details"}.</td>
                <td>Program lengths vary; check specific track.</td>
              </tr>
              <tr>
                <td>Pricing</td>
                <td>Full-Stack: {fullStack ? formatCoursePrice(fullStack.pricing) : "See course details"}.</td>
                <td>Varies by track/plan; see official pricing pages.</td>
              </tr>
              <tr>
                <td>Who it fits</td>
                <td>Learners comparing the course curriculum and current delivery details.</td>
                <td>Compare official program details with your learning needs.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Provider offerings change. Competitor details above are intentionally
          limited to items that should be verified on the official program page.
        </p>
      </section>

      {/* Who should pick which */}
      <section aria-labelledby="who-which" className="mb-10">
        <h2 id="who-which" className="text-2xl font-semibold mb-3">Who should pick which?</h2>
        <div className="space-y-3 text-gray-800">
          <p>
            Choose <strong>DCA</strong> to review the current{" "}
            <Link href="/online-courses/full-stack" className="text-blue-700 hover:underline">
              Online Full-Stack course details
            </Link>{" "}
            and compare its curriculum and delivery information.
          </p>
          <p>
            Consider <strong>Coding Ninjas</strong> if you prefer a large catalog and a national
            platform experience—review their official track pages for the latest syllabus, format,
            and support specifics.
          </p>
        </div>
      </section>

      {/* Still deciding? (expanded, retains existing styles) */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Still deciding?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Not sure between live cohorts and recorded videos? Read{" "}
            <Link href="/blog/live-vs-recorded-coding-classes-india" className="text-blue-700 hover:underline">
              Live vs Recorded Coding Classes (India)
            </Link>.
          </li>
          <li>
            Planning a visit to our campus? See{" "}
            <Link href="/blog/visit-dca-campus-dehradun-guide" className="text-blue-700 hover:underline">
              Visit DCA Campus (Dehradun): A Practical Guide
            </Link>.
          </li>
          <li>
            Prefer on-campus learning? Explore{" "}
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
              Full-Stack in Dehradun (On-Campus)
            </Link>.
          </li>
        </ul>
      </section>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          href="/online-courses/full-stack"
          size="lg"
          variant="primary"
          event="cta_enroll_click"
          eventParams={{ page_type: "vs_page", course_slug: "full-stack", variant: "body_primary" }}
        >
          Explore Online Full-Stack Course
        </Button>
        <Button
          href="/blog/best-full-stack-course-dehradun-2025"
          size="lg"
          variant="secondary"
          event="cta_enroll_click"
          eventParams={{ page_type: "vs_page", course_slug: "full-stack", variant: "body_secondary" }}
        >
          Read the Full-Stack Guide
        </Button>
        <Button
          href="https://wa.me/917037905464?text=I%20want%20to%20know%20more%20about%20DCA%20Full-Stack"
          size="lg"
          variant="ghost"
          target="_blank"
          rel="noopener noreferrer"
          event="lead_contact_click"
          eventParams={{ channel: "whatsapp" }}
        >
          Message on WhatsApp
        </Button>
      </div>

      {/* Conclusion (pruned) */}
      <section aria-labelledby="vs-coding-ninjas-conclusion" className="mt-10 border-t pt-8">
        <h2 id="vs-coding-ninjas-conclusion" className="text-xl font-semibold mb-3">Conclusion</h2>
        <p className="text-gray-700">
          To review the course curriculum and current details, see the{" "}
          <Link href="/courses/full-stack" className="text-blue-700 hover:underline">Full-Stack Bootcamp (On-Campus)</Link>.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Want to visit first? <Link href="/locations/dehradun" className="underline text-blue-700">See the Dehradun campus</Link>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            href="/courses/full-stack"
            size="lg"
            variant="primary"
            event="cta_enroll_click"
            eventParams={{ page_type: "vs_page", course_slug: "full-stack", variant: "conclusion" }}
          >
            Explore Full-Stack Bootcamp
          </Button>
        </div>
      </section>

      {/* BreadcrumbList JSON-LD (no /vs index yet → 2-item trail) */}
      <script
        id="breadcrumb-vs-coding-ninjas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE.url,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Doon Coding Academy vs Coding Ninjas",
                item: CANON,
              },
            ],
          }),
        }}
      />
    </main>
  );
}
