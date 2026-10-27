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
      className="bg-slate-50 py-16 sm:py-20"
    >
      <div className="container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              Guides
            </p>
            <h2
              id="home-guides-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
            >
              Helpful guides for coding learners
            </h2>
          </div>
          <TrackedLink
            href="/blog"
            event="cta_home_view_guides"
            eventParams={{ location: "home_guide_preview" }}
            className="inline-flex min-h-11 items-center font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            Browse all guides
          </TrackedLink>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm font-semibold text-blue-700">
                  {guide.category} · {guide.readingTime} min read
                </p>
                <h3 className="mt-3 text-lg font-bold leading-6 text-gray-950">
                  <TrackedLink
                    href={`/blog/${guide.slug}`}
                    event="cta_home_read_guide"
                    eventParams={{ guide_slug: guide.slug }}
                    className="rounded-sm hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
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
                  className="mt-5 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
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
