import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";
import LocationTabs, { type LocationTile } from "@/components/features/LocationTabs";

export const metadata = {
  title: "Locations – Learn Online or Visit Dehradun | Doon Coding Academy (DCA)",
  description:
    "Choose your path with Doon Coding Academy (DCA): visit our Dehradun campus for on-campus classes or join our live online cohorts from cities like Noida and Bangalore.",
  alternates: {
    canonical: "https://dooncodingacademy.in/locations",
  },
  openGraph: {
    title: "Locations – Learn Online or Visit Dehradun | Doon Coding Academy (DCA)",
    description:
      "Explore Doon Coding Academy (DCA) locations and online cohorts. On-campus in Dehradun, live online from anywhere in India including Noida and Bangalore.",
    url: "https://dooncodingacademy.in/locations",
    type: "website",
    siteName: "Doon Coding Academy",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function LocationsIndexPage() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: "https://dooncodingacademy.in/" },
    { name: "Locations", url: "https://dooncodingacademy.in/locations" },
  ]);

  const tiles: LocationTile[] = [
    {
      name: "Dehradun",
      badge: "On-Campus",
      href: "/locations/dehradun",
      blurb:
        "Visit our physical campus in Dehradun or explore the on-campus courses offered there.",
      primaryHref: "/courses/full-stack",
      primaryText: "View On-Campus Courses",
      secondaryHref: "/blog/visit-dca-campus-dehradun-guide",
      secondaryText: "Plan a Campus Visit",
    },
    {
      name: "Noida",
      badge: "Online",
      href: "/locations/noida",
      blurb:
        "Based in Noida? Join our live online cohorts with mentor support, recordings, and projects. Learn from anywhere.",
      primaryHref: "/online-courses",
      primaryText: "Explore Online Courses",
      secondaryHref: "/blog/live-vs-recorded-coding-classes-india",
      secondaryText: "Live vs Recorded",
    },
    {
      name: "Bangalore",
      badge: "Online",
      href: "/locations/bangalore",
      blurb:
        "In India’s tech capital? Explore live online course options and interview preparation.",
      primaryHref: "/online-courses",
      primaryText: "Explore Online Courses",
      secondaryHref: "/blog/live-vs-recorded-coding-classes-india",
      secondaryText: "Live vs Recorded",
    },
  ];

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <main className="container py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-10 rounded-dca-lg border border-brand-soft bg-gradient-to-br from-white to-bg-grid p-6 shadow-soft-blue sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Our Locations &amp; Online Cohorts</h1>
          <p className="mt-3 max-w-4xl text-lg leading-7 text-ink-2">
            Learn on-campus in <strong>Dehradun</strong> or join our {""}
            <Link href="/online-courses" className="font-semibold text-brand-dark hover:underline">
              live online courses
            </Link>{" "}
            from cities like Noida and Bangalore. Not sure which to pick? Start with {""}
            <Link
              href="/blog/live-vs-recorded-coding-classes-india"
              className="font-semibold text-brand-dark hover:underline"
            >
              Live vs Recorded
            </Link>
            .
          </p>
        </header>

        {/* Popular courses (details) — internal links for SEO + UX */}
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Popular DCA courses (details)
          </h2>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li>
              <Link href="/courses/full-stack" className="surface-card block p-4 font-semibold text-brand-dark underline decoration-brand/30 underline-offset-4 hover:bg-brand-soft">
                Full-Stack Development (with Gen AI)
              </Link>
            </li>
            <li>
              <Link href="/courses/data-science" className="surface-card block p-4 font-semibold text-brand-dark underline decoration-brand/30 underline-offset-4 hover:bg-brand-soft">
                Data Science & AI
              </Link>
            </li>
            <li>
              <Link href="/courses/python" className="surface-card block p-4 font-semibold text-brand-dark underline decoration-brand/30 underline-offset-4 hover:bg-brand-soft">
                Python Programming
              </Link>
            </li>
            <li>
              <Link href="/courses/java" className="surface-card block p-4 font-semibold text-brand-dark underline decoration-brand/30 underline-offset-4 hover:bg-brand-soft">
                Java & Spring Boot
              </Link>
            </li>
          </ul>
        </section>

        {/* Choose Your Path */}
        <section aria-labelledby="choose-path" className="mb-10">
          <h2 id="choose-path" className="text-2xl font-semibold text-ink">
            Choose Your Path
          </h2>

            <LocationTabs tiles={tiles} />
        </section>

        {/* CTA row */}
        <section className="mb-2">
          <div className="flex flex-wrap gap-3">
            <Link href="/online-courses" className="text-brand-dark hover:underline">
              Explore Online Courses
            </Link>
            <span className="text-ink-3">•</span>
            <Link
              href="/blog/live-vs-recorded-coding-classes-india"
              className="text-brand-dark hover:underline"
            >
              Live vs Recorded: Which is right for you?
            </Link>
            <span className="text-ink-3">•</span>
            <Link
              href="/blog/visit-dca-campus-dehradun-guide"
              className="text-brand-dark hover:underline"
            >
              Planning a campus visit (Dehradun)?
            </Link>
            <span className="text-ink-3">•</span>
            <Link href="/faq" className="text-brand-dark hover:underline">
              Read FAQs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
