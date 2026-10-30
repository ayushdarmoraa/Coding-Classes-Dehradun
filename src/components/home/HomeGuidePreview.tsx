import TrackedLink from "@/components/analytics/TrackedLink";
import type { BlogPost } from "@/lib/blog";

type GuidePreview = Pick<
  BlogPost,
  "slug" | "title" | "description" | "category" | "readingTime"
>;

export default function HomeGuidePreview({
  guides,
}: {
  guides: GuidePreview[];
}) {
  if (guides.length === 0) return null;

  return (
    <section
      aria-labelledby="home-guides-heading"
      className="bg-panel py-16 sm:py-20"
    >
      <div className="container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">
              Guides
            </p>
            <h2
              id="home-guides-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              Helpful guides for coding learners
            </h2>
          </div>
          <TrackedLink
            href="/blog"
            event="cta_home_view_guides"
            eventParams={{ location: "home_guide_preview" }}
            className="inline-flex min-h-11 items-center font-semibold text-brand-dark underline decoration-blue-300 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Browse all guides
          </TrackedLink>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <article className="surface-card flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-soft-blue">
                <p className="text-sm font-semibold text-brand-dark">
                  {guide.category} · {guide.readingTime} min read
                </p>
                <h3 className="mt-3 text-lg font-bold leading-6 text-ink">
                  <TrackedLink
                    href={`/blog/${guide.slug}`}
                    event="cta_home_read_guide"
                    eventParams={{ guide_slug: guide.slug }}
                    className="rounded-sm hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {guide.title}
                  </TrackedLink>
                </h3>
                <p className="mt-3 flex-1 leading-6 text-gray-600">
                  {guide.description}
                </p>
                <TrackedLink
                  href={`/blog/${guide.slug}`}
                  event="cta_home_read_guide"
                  eventParams={{ guide_slug: guide.slug }}
                  className="mt-5 inline-flex min-h-11 items-center font-semibold text-brand-dark hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Read guide
                  <span className="sr-only">: {guide.title}</span>
                  <span aria-hidden="true" className="ml-2">→</span>
                </TrackedLink>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
