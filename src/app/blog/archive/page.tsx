import type { Metadata } from "next";
import Link from "next/link";
import FeedLinks from "@/components/seo/FeedLinks";
import { archiveIndex, groupByYearMonth, monthName, postsIn } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog Archive | Doon Coding Academy",
  description:
    "Browse all blog posts by year and month—guides, tutorials, and career advice for Full-Stack, Data Science, Python, and Java.",
  alternates: { canonical: "/blog/archive" },
  openGraph: {
    title: "Blog Archive | Doon Coding Academy",
    description: "Explore our posts by year and month.",
    url: "/blog/archive",
    type: "website",
  },
};

export default function BlogArchivePage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string };
}) {
  const yearParam = searchParams?.year ? parseInt(searchParams.year, 10) : undefined;
  const monthParam = searchParams?.month ? parseInt(searchParams.month, 10) : undefined;

  const index = archiveIndex(); // [{year, months:[...]}]
  const years = index.map((i) => i.year);
  const latestYear = years[0];
  const validYear = yearParam && years.includes(yearParam) ? yearParam : undefined;

  const monthsForSelectedYear = validYear ? index.find((i) => i.year === validYear)?.months ?? [] : [];

  const validMonth = monthParam && monthParam >= 1 && monthParam <= 12 ? monthParam : undefined;

  const filtered = validYear || validMonth ? postsIn(validYear, validMonth) : undefined;

  return (
    <div className="container mx-auto p-4">
  <FeedLinks />
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">
          Blog
        </Link>{" "}
        <span>/</span> <span className="text-gray-700 font-semibold">Archive</span>
      </nav>

      <h1 className="text-3xl font-bold mb-4">Blog Archive</h1>
      <p className="text-gray-700 mb-6">Filter by year and month, or browse the full archive below.</p>

      {/* Filters (server-side, no JS) */}
      <form className="mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Year</label>
          <select name="year" defaultValue={validYear ?? ""} className="rounded-lg border px-3 py-1.5 text-sm">
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Month</label>
          <select name="month" defaultValue={validMonth ?? ""} className="rounded-lg border px-3 py-1.5 text-sm">
            <option value="">All months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} disabled={validYear ? !monthsForSelectedYear.includes(m) : false}>
                {monthName(m)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white">
          Apply
        </button>

        {(validYear || validMonth) && (
          <Link href="/blog/archive" className="rounded-lg border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700">
            Reset
          </Link>
        )}
      </form>

      {filtered ? (
        filtered.length === 0 ? (
          <p className="text-gray-700">No posts found for the selected period.</p>
        ) : (
          <section>
            <h2 className="text-xl font-semibold mb-3">{validMonth ? monthName(validMonth) + " " : ""}{validYear ?? latestYear}</h2>
            <ul className="space-y-3">
              {filtered.map((p) => (
                <li key={p.slug} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/blog/${p.slug}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(p.date).toLocaleDateString()} • {p.readingTime} min read
                  </p>
                  <p className="text-gray-700 mt-1 line-clamp-3">{p.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      ) : (
        <section className="space-y-8">
          {Array.from(groupByYearMonth().keys())
            .sort((a, b) => b - a)
            .map((year) => {
              const months = groupByYearMonth().get(year)!;
              const monthKeys = Array.from(months.keys()).sort((a, b) => b - a);
              return (
                <div key={year}>
                  <h2 id={`y-${year}`} className="text-2xl font-bold mb-3">
                    {year}
                  </h2>
                  <div className="space-y-6">
                    {monthKeys.map((m) => (
                      <div key={m}>
                        <h3 id={`y-${year}-m-${m}`} className="text-lg font-semibold mb-2">
                          {monthName(m)}
                        </h3>
                        <ul className="space-y-3">
                          {months.get(m)!.map((p) => (
                            <li key={p.slug} className="border rounded-lg p-4">
                              <h4 className="font-semibold">
                                <Link href={`/blog/${p.slug}`} className="hover:underline">
                                  {p.title}
                                </Link>
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {new Date(p.date).toLocaleDateString()} • {p.readingTime} min read
                              </p>
                              <p className="text-gray-700 mt-1 line-clamp-3">{p.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </section>
      )}
    </div>
  );
}
