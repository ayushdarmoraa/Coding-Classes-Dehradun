import {
  buildOutcomeItemListSchema,
  type PublishedOutcomeContent,
  type OutcomeMetric,
} from "@/lib/outcomes";

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function OutcomesContent({
  metrics,
  stories,
}: PublishedOutcomeContent) {
  const schema = buildOutcomeItemListSchema({ metrics, stories });
  const metricGroups: { kind: OutcomeMetric["kind"]; label: string }[] = [
    { kind: "completion", label: "Course completion" },
    { kind: "project-completion", label: "Project completion" },
    { kind: "placement", label: "Placements" },
  ];

  return (
    <main
      className="container mx-auto max-w-5xl px-4 py-10"
      aria-labelledby="outcomes-title"
    >
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      )}
      <header className="mb-10">
        <h1
          id="outcomes-title"
          className="text-3xl font-bold tracking-tight md:text-4xl"
        >
          Learner stories
        </h1>
        <p className="mt-4 max-w-3xl text-gray-700">
          Read learner feedback shared with publication permission. Any reported
          outcome metrics include their cohort, measurement method, evidence,
          and limitations.
        </p>
      </header>

      {metricGroups.map(({ kind, label }) => {
        const group = metrics.filter((metric) => metric.kind === kind);
        if (group.length === 0) return null;

        return (
          <section
            key={kind}
            aria-labelledby={`outcome-${kind}-title`}
            className="mb-10"
          >
            <h2
              id={`outcome-${kind}-title`}
              className="mb-5 text-2xl font-semibold"
            >
              {label}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {group.map((metric) => (
                <article
                  key={metric.slug}
                  className="rounded-xl border bg-white p-6"
                >
                  <h3 className="text-xl font-semibold">{metric.title}</h3>
                  <p className="mt-3 text-gray-800">{metric.publicStatement}</p>
                  <dl className="mt-5 space-y-3 text-sm text-gray-700">
                    <div>
                      <dt className="font-semibold">How it is measured</dt>
                      <dd>{metric.definition}</dd>
                    </div>
                    {metric.placementDefinition && (
                      <div>
                        <dt className="font-semibold">Placement definition</dt>
                        <dd>{metric.placementDefinition}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold">Numerator / denominator</dt>
                      <dd>
                        {metric.numerator.toLocaleString("en-IN")} /{" "}
                        {metric.denominator.toLocaleString("en-IN")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Eligible cohort</dt>
                      <dd>{metric.eligibleCohort}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Measurement period</dt>
                      <dd>
                        <time dateTime={metric.periodStart}>
                          {metric.periodStart}
                        </time>
                        {" – "}
                        <time dateTime={metric.periodEnd}>
                          {metric.periodEnd}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Sample size</dt>
                      <dd>{metric.sampleSize.toLocaleString("en-IN")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Exclusions</dt>
                      <dd>{metric.exclusions.join("; ")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Limitations</dt>
                      <dd>{metric.limitations}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Evidence source</dt>
                      <dd>{metric.sourceLabel}</dd>
                    </div>
                    {metric.kind === "project-completion" && (
                      <div>
                        <dt className="font-semibold">Project permission</dt>
                        <dd>
                          Publication permission for the reported project evidence
                          was verified.
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {stories.length > 0 && (
        <section
          aria-labelledby="verified-stories-title"
          className="mb-10"
        >
          <h2
            id="verified-stories-title"
            className="mb-5 text-2xl font-semibold"
          >
            Verified learner stories
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {stories.map((story) => (
              <figure
                key={story.slug}
                className="rounded-xl border bg-white p-6"
              >
                <blockquote className="text-gray-800">
                  <p>{story.quote}</p>
                </blockquote>
                <figcaption className="mt-4">
                  <cite className="font-semibold not-italic">
                    {story.attribution}
                  </cite>
                  <span className="mt-1 block text-sm text-gray-600">
                    Source:{" "}
                    {story.sourceUrl ? (
                      <a
                        href={story.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {story.sourceLabel}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      story.sourceLabel
                    )}
                    . The quote and attribution have verified publication
                    permission.
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
