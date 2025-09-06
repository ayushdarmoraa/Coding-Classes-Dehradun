/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getAllBlogPosts,
  getPostBySlug,
  getPostHtmlBySlug,
  relatedPosts,
} from "@/lib/blog";
import { nextPrevInSeries } from "@/lib/blog";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post || post.draft) return {};
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/${post.slug}`;
    const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    const base = rawBase.replace(/^http:\/\//, "https://");
    const url = `${base}/blog/${post.slug}`;

    // Fallback ensures every post gets a unique, click-friendly description
    const makeFallbackDescription = (title: string) => {
      const baseLine = `${title} — insights from Doon Coding Academy (Dehradun).`;
      const extra = " Compare options, syllabus, fees, and outcomes. Updated 2025.";
      const text = `${baseLine}${extra}`;
      return text.length > 160 ? text.slice(0, 157) + "…" : text;
    };

    const description =
      (post.description && post.description.trim().length > 0)
        ? post.description.trim()
        : makeFallbackDescription(post.title);

    return {
      title: `${post.title} | Doon Coding Academy`,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: post.title,
        description,
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: post.title,
        description,
      },
    };
}

// Heuristic: pick the best-matching course CTA by scanning title/desc/keywords
function pickCourseCTA(post: { title: string; description: string; keywords?: string[] }) {
  const hay = `${post.title} ${post.description} ${(post.keywords || []).join(" ")}`.toLowerCase();

  if (/(data\s*science|machine\s*learning|ml|ai|pandas|numpy|statistics)/.test(hay)) {
    return {
      title: "Data Science & AI",
      blurb: "Learn Python, NumPy, Pandas, ML & model evaluation — with hands-on projects.",
      href: "/courses/data-science",
    };
  }
  if (/(full[-\s]?stack|mern|react|node|express|mongodb|next\.?js)/.test(hay)) {
    return {
      title: "Full-Stack Development (MERN + Gen AI)",
      blurb: "Go end-to-end with React, Node.js, MongoDB and Gen AI integrations.",
      href: "/courses/full-stack",
    };
  }
  if (/(python|pythonic|cli|scripts)/.test(hay)) {
    return {
      title: "Python Programming",
      blurb: "Master Python fundamentals, OOP, files/JSON, and build useful mini-projects.",
      href: "/courses/python",
    };
  }
  if (/(java|spring|oop|collections)/.test(hay)) {
    return {
      title: "Java Programming",
      blurb: "Solidify Java fundamentals — OOP, collections, exceptions, and basics of Spring.",
      href: "/courses/java",
    };
  }
  return {
    title: "Explore our courses",
    blurb: "Not sure where to start? Browse all tracks — Full-Stack, Data Science, Python, Java.",
    href: "/courses",
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostHtmlBySlug(params.slug);
  if (!post) notFound();
  if (post.draft) notFound();

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/${post.slug}`;
  const publishedDate = new Date(post.date);
  const updatedDate = post.lastModified ? new Date(post.lastModified) : null;
  const showUpdated = !!(updatedDate && updatedDate.getTime() > publishedDate.getTime());

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  // Prev/next
  const all = getAllBlogPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = idx < all.length - 1 ? all[idx + 1] : undefined;
  const next = idx > 0 ? all[idx - 1] : undefined;
  const related = relatedPosts(post.slug, 3);
  const { prevInSeries, nextInSeries } = nextPrevInSeries(post.slug);

  // JSON-LD for BlogPosting
  const img = (() => {
    const raw = post.image?.trim();
    const def = `${base}/images/og/blog-default.jpg`;
    return raw ? (raw.startsWith("http") ? raw : `${base}${raw.startsWith("/") ? "" : "/"}${raw}`) : def;
  })();
  const authorNode = post.authorName
    ? { "@type": "Person", name: post.authorName, url: post.authorUrl || base }
    : { "@type": "Organization", name: "Doon Coding Academy", url: base };

  const blogPostingJsonLd = {
  // Stable org id for cross-entity linking (matches layout.tsx @id)
  // Example: https://dooncodingacademy.in/#organization
  // (base has no trailing slash)
  // NOTE: used below in publisher
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ORG_ID: `${base}/#organization`,
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: post.lastModified ?? new Date(post.date).toISOString(),
  author: authorNode,
  publisher: { "@id": `${base}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: post.keywords,
    articleSection: post.category,
    image: [img],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@type": "WebPage", "@id": `${base}/`, name: "Home" }
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@type": "WebPage", "@id": `${base}/blog`, name: "Blog" }
      },
      {
        "@type": "ListItem",
        position: 3,
        item: { "@type": "WebPage", "@id": url, name: post.title }
      }
    ],
  };
  const faqJsonLd = post.faqs && post.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;
  const howToJsonLd = post.howtoSteps && post.howtoSteps.length >= 2
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.title,
        description: post.description,
        image: img,
        totalTime: post.howtoTotalTime || undefined,
        estimatedCost: post.howtoEstimatedCost
          ? { "@type": "MonetaryAmount", currency: post.howtoEstimatedCost.currency, value: post.howtoEstimatedCost.value }
          : undefined,
        tool: (post.howtoTools || []).map((t) => ({ "@type": "HowToTool", name: t })),
        supply: (post.howtoSupplies || []).map((s) => ({ "@type": "HowToSupply", name: s })),
        step: post.howtoSteps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          url: s.url ? (s.url.startsWith("http") ? s.url : `${url}${s.url.startsWith("#") ? "" : "#"}${s.url}`) : undefined,
          itemListElement: s.text ? [{ "@type": "HowToDirection", text: s.text }] : undefined,
          image: s.image ? (s.image.startsWith("http") ? s.image : `${base}${s.image.startsWith("/") ? "" : "/"}${s.image}`) : undefined,
        })),
      }
    : null;

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      {/* Optional hero image (renders only if post.image is provided) */}
      {post.image ? (
        <div className="relative my-6 overflow-hidden rounded-2xl">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            width={1200}
            height={630}
            priority
            sizes="(max-width: 768px) 100vw, 960px"
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}
      <p className="text-gray-600 text-sm mb-6">
        Originally published on {publishedDate.toLocaleDateString()}
        {showUpdated ? (
          <>
            {" "}• <span className="font-medium">Updated on {updatedDate!.toLocaleDateString()}</span>
          </>
        ) : null}
        {" "}• {post.readingTime} min read •{" "}
        <Link href={`/blog/category/${encodeURIComponent(post.category)}`} className="text-blue-700 hover:underline">
          {post.category}
        </Link>
        {post.authorName ? (
          <>
            {" "}• By{" "}
            {post.authorUrl ? (
              <a className="text-blue-700 hover:underline" href={post.authorUrl}>{post.authorName}</a>
            ) : (
              <span className="text-gray-800">{post.authorName}</span>
            )}
          </>
        ) : null}
      </p>

      {post.keywords?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {post.keywords.map((k) => (
            <Link
              key={k}
              href={`/blog/tag/${encodeURIComponent(k)}`}
              className="rounded-md border px-2 py-1 text-xs text-gray-700"
            >
              #{k}
            </Link>
          ))}
        </div>
      ) : null}

      {post.series ? (
        <section className="mb-6 rounded-2xl border border-blue-700/20 bg-blue-600/5 p-4">
          <p className="text-sm text-blue-900">
            Series:{" "}
            <Link href={`/blog/series/${encodeURIComponent(post.series)}`} className="font-semibold text-blue-700 hover:underline">
              {post.series}
            </Link>
            {typeof post.seriesOrder === "number" ? ` • Part ${post.seriesOrder}` : null}
          </p>
          <div className="mt-2 flex justify-between gap-3 text-sm">
            {prevInSeries ? (
              <Link href={`/blog/${prevInSeries.slug}`} className="text-blue-700 hover:underline">
                ← {prevInSeries.title}
              </Link>
            ) : <span />}
            {nextInSeries ? (
              <Link href={`/blog/${nextInSeries.slug}`} className="text-blue-700 hover:underline">
                {nextInSeries.title} →
              </Link>
            ) : <span />}
          </div>
        </section>
      ) : null}

      {/* Content + TOC layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="dca-prose">
            {/* eslint-disable-next-line react/no-danger */}
            <article className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
        </div>

        {post.toc.length > 0 && (
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 dca-toc">
              <h2>On this page</h2>
              <ul className="space-y-1 text-sm">
                {post.toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
                    <a href={`#${h.id}`} className="text-blue-700 hover:underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* Conversion CTA (maps post topic → best course) */}
      <section className="mt-10 rounded-2xl border border-blue-700/20 bg-blue-600/5 p-5">
        {(() => {
          const cta = pickCourseCTA(post);
          const utm = `utm_source=blog&utm_medium=cta&utm_campaign=blog_to_course&utm_content=${encodeURIComponent(post.slug)}`;
          const primaryHref = `${cta.href}${cta.href.includes("?") ? "&" : "?"}${utm}`;
          const allCoursesHref = `/courses?${utm}`;
          return (
            <>
              <h2 className="text-xl font-semibold mb-2">Ready to go deeper? {cta.title}</h2>
              <p className="text-gray-700 mb-3">{cta.blurb}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
                >
                  View course
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                >
                  Get a free consultation
                </Link>
                <Link
                  href={allCoursesHref}
                  className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                >
                  Explore all courses
                </Link>
                <a
                  href="https://wa.me/917037905464?text=Hi%2C%20I%27m%20interested%20after%20reading%20your%20blog%20post"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </>
          );
        })()}
      </section>

      {/* HowTo steps (render only when provided) */}
      {post.howtoSteps && post.howtoSteps.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Step-by-step guide</h2>
          {(post.howtoTotalTime || post.howtoEstimatedCost || post.howtoTools?.length || post.howtoSupplies?.length) && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {post.howtoTotalTime ? (
                <span className="rounded-md border px-2 py-1 bg-white">⏱ Total time: {post.howtoTotalTime}</span>
              ) : null}
              {post.howtoEstimatedCost ? (
                <span className="rounded-md border px-2 py-1 bg-white">💰 Est. cost: {post.howtoEstimatedCost.value} {post.howtoEstimatedCost.currency}</span>
              ) : null}
              {post.howtoTools?.length ? (
                <span className="rounded-md border px-2 py-1 bg-white">🛠 Tools: {post.howtoTools.join(", ")}</span>
              ) : null}
              {post.howtoSupplies?.length ? (
                <span className="rounded-md border px-2 py-1 bg-white">📦 Supplies: {post.howtoSupplies.join(", ")}</span>
              ) : null}
            </div>
          )}
          <ol className="space-y-3">
            {post.howtoSteps.map((s, i) => {
              const stepImg = s.image ? (s.image.startsWith("http") ? s.image : `${base}${s.image.startsWith("/") ? "" : "/"}${s.image}`) : null;
              const anchorId = `step-${i + 1}`;
              return (
                <li key={i} id={anchorId} className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.text ? <p className="text-gray-700 mt-1">{s.text}</p> : null}
                      {s.url ? (
                        <p className="mt-2">
                          <a className="text-blue-700 hover:underline" href={s.url.startsWith("http") ? s.url : `#${anchorId}`}>
                            Reference
                          </a>
                        </p>
                      ) : null}
                      {stepImg ? (
                        <img
                          src={stepImg}
                          alt={s.name}
                          loading="lazy"
                          decoding="async"
                          className="mt-3 w-full h-auto rounded-lg border border-gray-200"
                        />
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {/* FAQs */}
      {post.faqs && post.faqs.length > 0 ? (
        <section className="mt-10" aria-labelledby="faqs">
          <h2 id="faqs" className="text-2xl font-semibold mb-3">Frequently asked questions</h2>
          <dl className="divide-y divide-gray-200 rounded-2xl border">
            {post.faqs.map((f, i) => (
              <div key={i} className="p-4">
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-1 text-gray-700">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Prev/Next */}
      <nav className="mt-10 flex justify-between gap-4">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="text-blue-700 hover:underline">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="text-blue-700 hover:underline">
            {next.title} →
          </Link>
        ) : <span />}
      </nav>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Related posts</h2>
          <ul className="list-disc ml-6 space-y-1">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="text-blue-700 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* JSON-LD */}
      <Script
        id="blogposting-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      {howToJsonLd ? (
        <Script
          id="howto-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      ) : null}
    </div>
  );
}


