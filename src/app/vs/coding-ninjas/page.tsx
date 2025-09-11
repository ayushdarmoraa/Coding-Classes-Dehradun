import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const HTTPS = RAW.replace(/^http:\/\//, "https://");
const APEX = HTTPS.replace(/^https:\/\/www\./, "https://");
const CANON = `${APEX}/vs/coding-ninjas`;

export const metadata: Metadata = {
  title: "Doon Coding Academy vs Coding Ninjas (2025)",
  description:
    "A clear, honest comparison of DCA vs Coding Ninjas for Full-Stack learners in India—curriculum focus, format, batch size, mentoring, outcomes, and who each suits.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Doon Coding Academy vs Coding Ninjas (2025)",
    description:
      "Compare DCA and Coding Ninjas: format (live vs recorded), batch size, mentoring, projects, pricing approach, and who each option fits best.",
    url: CANON,
    type: "article",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doon Coding Academy vs Coding Ninjas (2025)",
    description:
      "Which should you pick for Full-Stack in India? See the side-by-side comparison and decide confidently.",
  },
};

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          Doon Coding Academy vs Coding Ninjas (2025)
        </h1>
        <p className="mt-3 text-lg text-gray-700">
          Choosing a Full-Stack program? Here’s a practical, side-by-side view of{" "}
          <strong>Doon Coding Academy (DCA)</strong> and{" "}
          <strong>Coding Ninjas</strong> based on public program patterns and what
          Indian learners typically look for: delivery format, batch size, mentoring,
          projects, and career support. Details can change—always verify on the provider’s
          site before you enroll.
        </p>
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
                <td>Live cohorts with recordings, mentor hours, project reviews.</td>
                <td>Varies by track; mixes live/recorded depending on program.</td>
              </tr>
              <tr>
                <td>Focus</td>
                <td>MERN + Gen AI, job-ready projects, small-group support.</td>
                <td>Broad catalog across tracks; depth varies by specialization.</td>
              </tr>
              <tr>
                <td>Batch Size</td>
                <td>Small batches (target ≤ 15) for personalized attention.</td>
                <td>Typically larger national cohorts (varies by batch).</td>
              </tr>
              <tr>
                <td>Mentoring</td>
                <td>Direct mentor hours, code reviews, interview prep.</td>
                <td>Mentor support available; cadence & ratio vary by course.</td>
              </tr>
              <tr>
                <td>Projects</td>
                <td>Hands-on portfolio projects with feedback.</td>
                <td>Project work included; requirements vary by track.</td>
              </tr>
              <tr>
                <td>Duration</td>
                <td>Full-Stack: ~6 months (live + projects).</td>
                <td>Program lengths vary; check specific track.</td>
              </tr>
              <tr>
                <td>Pricing</td>
                <td>Transparent, city-friendly; e.g., Full-Stack ₹25,000.</td>
                <td>Varies by track/plan; see official pricing pages.</td>
              </tr>
              <tr>
                <td>Who it fits</td>
                <td>Learners who want close guidance and a smaller cohort.</td>
                <td>Learners who prefer a large national platform’s ecosystem.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Note: Provider offerings evolve. Use this page as a starting point and verify
          the latest details on each provider’s website.
        </p>
      </section>

      {/* Who should pick which */}
      <section aria-labelledby="who-which" className="mb-10">
        <h2 id="who-which" className="text-2xl font-semibold mb-3">Who should pick which?</h2>
        <div className="space-y-3 text-gray-800">
          <p>
            Choose <strong>DCA</strong> if you want a small-batch, mentor-led{" "}
            <Link href="/online-courses/full-stack" className="text-blue-700 hover:underline">
              Online Full-Stack (Live + Projects)
            </Link>{" "}
            experience with recordings, weekly touchpoints, and focused placement prep.
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
              Full-Stack in Dehradun (On-Campus/Hybrid)
            </Link>.
          </li>
        </ul>
      </section>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/online-courses/full-stack" size="lg" variant="primary">
          Start Online Full-Stack (Live + Projects)
        </Button>
        <Button href="/blog/best-full-stack-course-dehradun-2025" size="lg" variant="secondary">
          Read the Full-Stack Guide
        </Button>
      </div>

      {/* Conclusion (pruned) */}
      <section aria-labelledby="vs-coding-ninjas-conclusion" className="mt-10 border-t pt-8">
        <h2 id="vs-coding-ninjas-conclusion" className="text-xl font-semibold mb-3">Conclusion</h2>
        <p className="text-gray-700">
          For hands-on mentorship, smaller cohorts, and structured project reviews choose the {" "}
          <Link href="/courses/full-stack" className="text-blue-700 hover:underline">Full-Stack Bootcamp (On-Campus)</Link>.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Want to visit first? <Link href="/locations/dehradun" className="underline text-blue-700">See the Dehradun campus</Link>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/courses/full-stack" size="lg" variant="primary">Explore Full-Stack Bootcamp</Button>
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
                item: APEX,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Doon Coding Academy vs Coding Ninjas (2025)",
                item: CANON,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
