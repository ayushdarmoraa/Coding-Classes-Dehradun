import TrackedLink from "@/components/analytics/TrackedLink";

export default function LabPreview() {
  return (
    <section
      aria-labelledby="lab-preview-heading"
      className="container py-16 sm:py-20"
    >
      <div className="grid items-center gap-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            One real mission to try
          </p>
          <h2
            id="lab-preview-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
          >
            Try Coding Before You Enrol
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-700">
            Fix a discount calculation, run the checks, and see which skills
            your work demonstrates. This preview links to the mission that is
            available now.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 font-medium text-blue-900">
              JavaScript
            </span>
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 font-medium text-blue-900">
              Beginner
            </span>
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 font-medium text-blue-900">
              5–10 minutes
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <TrackedLink
            href="/lab/javascript/discount-calculation-bug"
            event="cta_home_lab_start"
            eventParams={{ location: "home_lab_preview" }}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Start the challenge
          </TrackedLink>
          <TrackedLink
            href="/lab"
            event="cta_home_lab_explore"
            eventParams={{ location: "home_lab_preview" }}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-700 bg-white px-5 py-3 font-semibold text-blue-800 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Explore DCA Lab
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
