import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/site-config";

// Bangalore service areas and local FAQ
const SERVICE_AREAS_BANGALORE = [
  "Whitefield",
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Electronic City",
  "Nearby suburbs",
];

const LOCAL_FAQ_BANGALORE = [
  {
    q: "Do you offer offline classes in Bangalore?",
    a: "Our physical campus is in Dehradun. Contact DCA to confirm whether online delivery is currently available for your chosen course.",
  },
  {
    q: "What are the batch sizes?",
    a: "Contact us for current class-size details.",
  },
  {
    q: "Are classes suitable for working professionals?",
    a: "Contact DCA for current schedule and batch information.",
  },
  {
    q: "Can I visit a local center in Bangalore?",
    a: "We do not list a physical campus in Bangalore. Contact DCA to confirm current delivery and learner-support options.",
  },
];

export const metadata: Metadata = {
  title: "Coding Classes in Bangalore – Doon Coding Academy",
  description:
    "Review Doon Coding Academy course details for Bangalore learners and contact us to confirm current online delivery and support options. Our campus is in Dehradun.",
  alternates: {
    canonical: `${SITE.url}/locations/bangalore`,
  },
  openGraph: {
    title: "Coding Classes in Bangalore – Doon Coding Academy",
    description:
      "Review course details for Bangalore learners and confirm delivery options with the academy. Visit the Dehradun campus if you’re nearby.",
    url: `${SITE.url}/locations/bangalore`,
    type: "website",
    siteName: SITE.name,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: `${SITE.url}/` },
    { name: "Bangalore", url: `${SITE.url}/locations/bangalore` },
  ]);

  return (
    <div className="min-h-screen bg-panel">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <header className="cd-hero mb-8 rounded-dca-lg p-6 sm:p-9">
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
            Coding Course Options for Bangalore Learners
          </h1>
          <p className="mt-3 text-gray-700">
            Review course details from Doon Coding Academy (DCA) and contact us to confirm current delivery and support options. Our{" "}
            <Link
              href="/locations/dehradun"
              className="text-blue-700 hover:underline"
            >
              physical campus is in Dehradun
            </Link>
            ; delivery availability varies by course.
          </p>
        </header>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            href="/online-courses/full-stack"
            variant="primary"
            event="cta_enroll_click"
            eventParams={{ page_type: "location_page", course_slug: "full-stack", city: "india", variant: "hero_online" }}
          >
            Explore Online Full-Stack
          </Button>
          <Button
            href="https://wa.me/917037905464?text=Hi%2C%20I%20am%20from%20Bangalore%20and%20want%20course%20details"
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
            event="lead_contact_click"
            eventParams={{ channel: "whatsapp", page_type: "location_page", city: "india" }}
          >
            WhatsApp Us
          </Button>
        </div>

        {/* Service Areas (Bangalore) */}
        <section className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold">Service Areas</h2>
          <p className="mt-2 text-gray-700">
            Learners across {SERVICE_AREAS_BANGALORE.slice(0, -1).join(", ")} and {SERVICE_AREAS_BANGALORE.at(-1)} can review course details and ask DCA about current delivery options. {" "}
            Explore detailed curricula: {" "}
            <Link href="/courses/full-stack" className="underline">Full-Stack</Link>,{" "}
            <Link href="/courses/data-science" className="underline">Data Science</Link>,{" "}
            <Link href="/courses/python" className="underline">Python</Link>,{" "}
            <Link href="/courses/java" className="underline">Java</Link>.
          </p>
        </section>

        {/* Local FAQs (Bangalore) */}
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">FAQs (Bangalore)</h2>
          <div className="mt-3 space-y-3">
            {LOCAL_FAQ_BANGALORE.map((item) => (
              <details key={item.q} className="rounded-xl border p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-gray-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Why Bangalore (online with DCA) */}
        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold">Why learners in Bangalore pick DCA</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Review the published curriculum and course details</li>
            <li>Contact DCA to confirm current delivery, schedule, and learner support</li>
            <li>Ask which practical work is currently included in your chosen course</li>
            <li>Contact DCA for current information about internship or placement support</li>
          </ul>
          <p className="text-gray-700">
            Review course curricula and published outcomes directly. Course pages do not guarantee interviews, employment, or placement.
          </p>
        </section>

        {/* Courses slice (Full-Stack, Data Science, Python) */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Popular courses for Bangalore learners</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <Link
                href="/online-courses/full-stack"
                className="text-blue-700 hover:underline"
              >
                Online Full-Stack (MERN)
              </Link>{" "}
              – review the published curriculum and outcomes
            </li>
            <li>
              <Link
                href="/courses/data-science"
                className="text-blue-700 hover:underline"
              >
                Data Science &amp; AI
              </Link>{" "}
              – review the curriculum and contact DCA to confirm availability
            </li>
            <li>
              <Link
                href="/online-courses/python"
                className="text-blue-700 hover:underline"
              >
                Online Python
              </Link>{" "}
              – review the published curriculum
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
          {/* Pruned data science comparison links */}
        </section>

        {/* Job market context */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Bangalore job market snapshot</h2>
          <p className="text-gray-700 mt-2">
            From early-stage startups to unicorns and global captives, Bangalore
            expects applied skills, portfolio proof, and collaboration. Our
            cohorts mirror workplace workflows so you’re ready on day one.
          </p>
          <p className="text-gray-700 mt-3 text-sm">
            Placement support details: <Link href="/faq" className="underline text-blue-700">FAQ</Link>.
          </p>
        </section>

        {/* Popular DCA courses (detail pages) */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Popular DCA courses (details)</h2>
          <p className="text-gray-700 mt-2">
            Comparing tracks? Review the full details, curriculum, and outcomes on these pages:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
                Full-Stack Course (MERN + Gen AI)
              </Link>
            </li>
            <li>
              <Link href="/courses/data-science" className="text-blue-700 hover:underline">
                Data Science Course (Python, ML foundations)
              </Link>
            </li>
            <li>
              <Link href="/courses/python" className="text-blue-700 hover:underline">
                Python Course
              </Link>
            </li>
            <li>
              <Link href="/courses/java" className="text-blue-700 hover:underline">
                Java Course (OOP and backend basics)
              </Link>
            </li>
          </ul>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold">Is there a DCA center in Bangalore?</h3>
              <p className="text-gray-700">
                No. Our physical campus is in Dehradun. Contact DCA to confirm current delivery options for each course.
                {" "}
                <Link href="/locations/dehradun" className="underline text-blue-700">See campus details</Link>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What’s the class schedule?</h3>
              <p className="text-gray-700">
                Contact DCA to confirm current batch schedules and whether recordings are available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">
                Do you provide placement support for Bangalore learners?
              </h3>
              <p className="text-gray-700">
                Contact DCA to confirm whether internship or placement support is currently available.
              </p>
            </div>
          </div>
        </section>

        {/* FAQPage JSON-LD for Bangalore (generated from LOCAL_FAQ_BANGALORE) */}
        <script
          id="faq-bangalore"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: LOCAL_FAQ_BANGALORE.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />

        {/* CTA (reuse Noida text/links) */}
        <section className="mb-2">
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/online-courses" className="text-blue-700 hover:underline">
              Explore Online Courses
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
            <span className="text-gray-400">•</span>
            <Button
              href="https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9"
              variant="ghost"
              target="_blank"
              rel="noopener noreferrer"
              event="lead_contact_click"
              eventParams={{ channel: "directions", page_type: "location_page", city: "india" }}
            >
              Directions
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
