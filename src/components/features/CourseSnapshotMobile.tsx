"use client";

export type Row = {
  name: string;
  level: string;
  mode: string;
  duration: string;
  fees: string;
  outcome?: string;
  ctaHref?: string;
};

export default function CourseSnapshotMobile({ rows }: { rows: Row[] }) {
  return (
    <div className="space-y-4 md:hidden">
      {rows.map((r) => (
        <article key={r.name} className="rounded-2xl border p-4 shadow-sm">
          <h3 className="text-lg font-semibold">{r.name}</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Course level</dt><dd>{r.level}</dd>
            <dt className="text-gray-500">Mode</dt><dd>{r.mode}</dd>
            <dt className="text-gray-500">Duration</dt><dd>{r.duration}</dd>
            <dt className="text-gray-500">Fees</dt><dd>{r.fees}</dd>
            {r.outcome ? (<><dt className="text-gray-500">Outcome</dt><dd>{r.outcome}</dd></>) : null}
          </dl>
          {r.ctaHref ? (
            <a
              href={r.ctaHref}
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
              aria-label={`View details for ${r.name}`}
            >
              View details
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
