import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Locations – Learn Online or Visit Dehradun | DCA",
  description:
    "Choose your path with Doon Coding Academy: visit our Dehradun campus for on-campus classes or join our live online cohorts from cities like Noida and Bangalore.",
  alternates: {
    canonical: "https://dooncodingacademy.in/locations",
  },
  openGraph: {
    title: "Locations – Learn Online or Visit Dehradun | DCA",
    description:
      "Explore DCA locations and online cohorts. On-campus in Dehradun, live online from anywhere in India including Noida and Bangalore.",
    url: "https://dooncodingacademy.in/locations",
    type: "website",
    siteName: "Doon Coding Academy",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

interface Tile {
  name: string;
  badge: string;
  href: string;
  blurb: string;
  primaryHref: string;
  primaryText: string;
  secondaryHref: string;
  secondaryText: string;
}

export default function LocationsIndexPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://dooncodingacademy.in/" },
      { "@type": "ListItem", position: 2, name: "Locations", item: "https://dooncodingacademy.in/locations" },
    ],
  };

  const tiles: Tile[] = [
    {
      name: "Dehradun",
      badge: "On-Campus",
      href: "/locations/dehradun",
      blurb:
        "Visit our physical campus for on-campus/hybrid classes with mentors and labs. Prefer classroom learning? Start here.",
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
        "In India’s tech capital? Build a job-ready portfolio via live online cohorts—small batches and interview prep.",
      primaryHref: "/online-courses",
      primaryText: "Explore Online Courses",
      secondaryHref: "/blog/live-vs-recorded-coding-classes-india",
      secondaryText: "Live vs Recorded",
    },
  ];

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
          <h1 className="text-3xl font-bold">Our Locations &amp; Online Cohorts</h1>
          <p className="mt-3 text-gray-700">
            Learn on-campus in <strong>Dehradun</strong> or join our {""}
            <Link href="/online-courses" className="text-blue-700 hover:underline">
              live online courses
            </Link>{" "}
            from cities like Noida and Bangalore. Not sure which to pick? Start with {""}
            <Link
              href="/blog/live-vs-recorded-coding-classes-india"
              className="text-blue-700 hover:underline"
            >
              Live vs Recorded
            </Link>
            .
          </p>
        </header>

        {/* Choose Your Path */}
        <section aria-labelledby="choose-path" className="mb-10">
          <h2 id="choose-path" className="text-2xl font-semibold">
            Choose Your Path
          </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiles.map((t) => (
                <Card key={t.name} className="flex flex-col p-0">
                  <div className="p-6 pb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{t.name}</h3>
                    <span className="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                      {t.badge}
                    </span>
                  </div>
                  <div className="px-6 text-gray-700">
                    <p>{t.blurb}</p>
                    <p className="mt-3 text-sm">
                      Start with {""}
                      <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
                        Full-Stack
                      </Link>{" "}
                      or browse {""}
                      <Link href="/online-courses" className="text-blue-700 hover:underline">
                        Online Courses
                      </Link>
                      .
                    </p>
                  </div>
                  <div className="px-6 pt-5 flex gap-2">
                    <Button href={t.primaryHref} size="sm" className="flex-1">
                      {t.primaryText}
                    </Button>
                    <Button href={t.href} variant="secondary" size="sm" className="flex-1">
                      Learn More
                    </Button>
                  </div>
                  <div className="px-6 pt-3 pb-6">
                    <Link
                      href={t.secondaryHref}
                      className="text-blue-700 hover:underline text-sm"
                    >
                      {t.secondaryText}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
        </section>

        {/* CTA row */}
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
