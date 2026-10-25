import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getCourseBySlug } from "@/lib/courses";
import { formatCoursePrice } from "@/lib/pricing";

const APEX = "https://dooncodingacademy.in";

export const metadata: Metadata = {
  title: "Doon Coding Academy vs Scaler (2025)",
  description:
    "Transparent comparison of DCA vs Scaler: curriculum depth, fees, format, batch size, mentor ratio and placement support — plus who should pick which.",
  alternates: { canonical: `${APEX}/vs/scaler` },
  openGraph: {
    title: "Doon Coding Academy vs Scaler (2025)",
    description:
      "Compare curriculum, fees, format, batch size, mentor ratio and placement support — get the facts.",
    url: `${APEX}/vs/scaler`,
    type: "article",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doon Coding Academy vs Scaler (2025)",
    description:
      "Compare curriculum, fees, format, batch size, mentor ratio and placement support.",
  },
};

export default function Page() {
  const fullStack = getCourseBySlug("full-stack");
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Doon Coding Academy vs Scaler (2025)
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Choosing between platforms? Here’s a practical, outcome-focused comparison to help you decide.
        To review the current Full-Stack curriculum and online-course details, see{" "}
        <Link href="/online-courses/full-stack" className="text-blue-700 hover:underline">
          DCA’s Online Full-Stack course
        </Link>. For general FAQs, see{" "}
        <Link href="/faq" className="text-blue-700 hover:underline">our FAQ</Link>.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Criteria</th>
              <th className="px-4 py-3 font-semibold">Doon Coding Academy</th>
              <th className="px-4 py-3 font-semibold">Scaler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-3">Curriculum span</td>
              <td className="px-4 py-3">Full-Stack MERN with Gen AI; fundamentals → advanced with portfolio</td>
              <td className="px-4 py-3">Software dev / DS tracks; broader theory-first modules</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Format</td>
              <td className="px-4 py-3">See current online-course details for delivery information</td>
              <td className="px-4 py-3">Primarily online; schedule varies by track</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Batch size</td>
              <td className="px-4 py-3">Contact DCA for current class-size details</td>
              <td className="px-4 py-3">Larger cohorts typical of national platforms</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Mentor ratio</td>
              <td className="px-4 py-3">Contact DCA for current learner-support details</td>
              <td className="px-4 py-3">Varies; 1:many mentorship</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Projects / portfolio</td>
              <td className="px-4 py-3">Review the course curriculum and listed outcomes</td>
              <td className="px-4 py-3">Projects present; portfolio depth varies by learner</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Placement support</td>
              <td className="px-4 py-3">Contact DCA for current career-support details</td>
              <td className="px-4 py-3">Career services at scale; competitive pipelines</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Fees (indicative)</td>
              <td className="px-4 py-3">{fullStack ? formatCoursePrice(fullStack.pricing) : "See course details"} (Full-Stack)</td>
              <td className="px-4 py-3">Typically higher for comparable tracks</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Best for</td>
              <td className="px-4 py-3">Learners comparing the curriculum and current course details</td>
              <td className="px-4 py-3">Learners preferring large networks and brand recognition</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Who should pick which */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Who should pick which?</h2>
        <p className="text-gray-700">
          Review DCA’s current course curriculum, fees, and delivery information alongside
          Scaler’s official program details before choosing. Pick <strong>Scaler</strong> if you value larger communities
          and broader brand presence.
        </p>
      </div>

      {/* Further reading & next steps (new) */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Further reading &amp; next steps</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Not sure between live cohorts and recorded videos? Read{" "}
            <Link href="/blog/live-vs-recorded-coding-classes-india" className="text-blue-700 hover:underline">
              Live vs Recorded Coding Classes (India)
            </Link>.
          </li>
          <li>
            Ready to learn online with mentors and projects? Explore our{" "}
            <Link href="/online-courses/full-stack" className="text-blue-700 hover:underline">
              Online Full-Stack course details
            </Link>.
          </li>
        </ul>
      </section>

      {/* Conclusion (pruned) */}
      <section aria-labelledby="vs-scaler-conclusion" className="mt-10 border-t pt-8">
        <h2 id="vs-scaler-conclusion" className="text-xl font-semibold mb-3">Conclusion</h2>
        <p className="text-gray-700">
          To review the Full-Stack course curriculum and details, see our{" "}
          <Link href="/courses/full-stack" className="text-blue-700 hover:underline">Full-Stack Bootcamp (On-Campus)</Link> is a focused, project-first path.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Prefer a visit first? <Link href="/locations/dehradun" className="underline text-blue-700">See the Dehradun campus</Link>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            href="/courses/full-stack"
            size="lg"
            variant="primary"
            event="cta_enroll_click"
            eventParams={{ page_type: 'comparison', course_slug: 'full-stack', variant: 'conclusion_primary' }}
          >
            Explore Full-Stack Bootcamp
          </Button>
        </div>
      </section>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          href="/online-courses/full-stack"
          size="lg"
          variant="primary"
          event="cta_enroll_click"
          eventParams={{ page_type: 'comparison', course_slug: 'full-stack', variant: 'post_body_primary_online' }}
        >
          Explore Full-Stack Online Course
        </Button>
        <Button
          href="/blog/best-full-stack-course-dehradun-2025"
          size="lg"
          variant="secondary"
          event="cta_enroll_click"
          eventParams={{ page_type: 'comparison', course_slug: 'full-stack', variant: 'post_body_secondary_guide' }}
        >
          Read: Best Full-Stack Course (Guide)
        </Button>
      </div>

      {/* BreadcrumbList JSON-LD */}
      <script
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
                item: `${APEX}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Doon Coding Academy vs Scaler (2025)",
                item: `${APEX}/vs/scaler`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
