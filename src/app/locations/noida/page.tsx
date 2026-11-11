import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/site-config";

// Noida service areas and local FAQ
const SERVICE_AREAS_NOIDA = [
  "Sector 15",
  "Sector 18",
  "Sector 62",
  "Greater Noida",
  "Ghaziabad",
  "Nearby regions",
];

const LOCAL_FAQ_NOIDA = [
  {
    q: "Do you provide offline classes in Noida?",
    a: "Our physical campus is in Dehradun. Contact DCA to confirm whether online delivery is currently available for your chosen course.",
  },
  {
    q: "Are the online courses interactive?",
    a: "Contact DCA to confirm the current online format and any learner support for the course you are considering.",
  },
  {
    q: "What are the batch timings?",
    a: "Contact DCA for current schedule and batch information.",
  },
  {
    q: "Is placement support available for Noida students?",
    a: "Contact DCA to confirm whether internship or placement support is currently available.",
  },
];

export const metadata: Metadata = {
  title: "Coding Classes in Noida – Doon Coding Academy",
  description:
    "Review Doon Coding Academy course details for Noida learners and contact us to confirm current online delivery and support options. Our campus is in Dehradun.",
  alternates: {
    canonical: `${SITE.url}/locations/noida`,
  },
  openGraph: {
    title: "Coding Classes in Noida – Doon Coding Academy",
    description:
      "Review course details for Noida learners and confirm delivery options with the academy. Visit the Dehradun campus if you’re nearby.",
    url: `${SITE.url}/locations/noida`,
    type: "website",
    siteName: SITE.name,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: `${SITE.url}/` },
    { name: "Noida", url: `${SITE.url}/locations/noida` },
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
            Coding Course Options for Noida Learners
          </h1>
          <p className="mt-3 text-gray-700">
            Based in Noida? Review the course details from Doon Coding Academy (DCA) and contact us to confirm current delivery and support options. Our
            <span className="whitespace-nowrap"> </span>
            <Link
              href="/locations/dehradun"
              className="text-blue-700 hover:underline"
            >
              physical campus is in Dehradun
            </Link>
            ; contact us to confirm delivery availability by course.
          </p>
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
              href="https://wa.me/917037905464?text=Hi%2C%20I%20am%20from%20Noida%20and%20want%20course%20details"
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              event="lead_contact_click"
              eventParams={{ channel: "whatsapp", page_type: "location_page", city: "india" }}
            >
              WhatsApp Us
            </Button>
          </div>
        </header>

        {/* Service Areas (Noida) */}
        <section className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold">Service Areas</h2>
          <p className="mt-2 text-gray-700">
            Learners across {SERVICE_AREAS_NOIDA.slice(0, -1).join(", ")} and {SERVICE_AREAS_NOIDA.at(-1)} can review course details and ask DCA about current delivery options. {" "}
            Check out our detailed courses: {" "}
            <Link href="/courses/full-stack" className="underline">Full-Stack</Link>,{" "}
            <Link href="/courses/data-science" className="underline">Data Science</Link>,{" "}
            <Link href="/courses/python" className="underline">Python</Link>,{" "}
            <Link href="/courses/java" className="underline">Java</Link>.
          </p>
        </section>

        {/* Local FAQs (Noida) */}
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold">FAQs (Noida)</h2>
          <div className="mt-3 space-y-3">
            {LOCAL_FAQ_NOIDA.map((item) => (
              <details key={item.q} className="rounded-xl border p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-gray-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Why Noida (online with DCA) */}
        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold">Why learners in Noida pick DCA</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Review the published curriculum and course details</li>
            <li>Contact DCA to confirm current delivery, schedule, and learner support</li>
            <li>Ask which practical work is currently included in your chosen course</li>
            <li>Contact DCA for current information about internship or placement support</li>
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
              – review the published curriculum and outcomes
            </li>
            <li>
              <Link
                href="/courses/data-science"
                className="text-blue-700 hover:underline"
              >
                Data Science &amp; AI course details
              </Link>{" "}
              – review the curriculum and confirm delivery availability
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
          {/* Pruned extra comparison links for density */}
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

        {/* Job market context */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">Noida job market snapshot</h2>
          <p className="text-gray-700 mt-2">
            The Delhi-NCR corridor (Noida, Greater Noida, Delhi, Gurgaon) has a
            dense mix of SaaS startups, IT services, and product teams. Employers
            expect practical skills, Git discipline, and deployment know-how.
            Review course curricula and published outcomes directly. Course pages do not guarantee interviews, employment, or placement.
          </p>
          <p className="text-gray-700 mt-3 text-sm">
            Contact DCA to confirm whether internship or placement support is currently available.
          </p>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold">Is there a DCA center in Noida?</h3>
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
                Do you provide placement support for Noida learners?
              </h3>
              <p className="text-gray-700">
                Contact DCA to confirm whether internship or placement support is currently available.
              </p>
            </div>
          </div>
        </section>

        {/* FAQPage JSON-LD for Noida (generated from LOCAL_FAQ_NOIDA) */}
        <script
          id="faq-noida"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: LOCAL_FAQ_NOIDA.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />

        {/* CTA */}
        <section className="mb-2">
          <div className="flex flex-wrap gap-3 items-center">
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
