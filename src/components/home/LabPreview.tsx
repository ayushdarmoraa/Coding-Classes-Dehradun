import TrackedLink from "@/components/analytics/TrackedLink";
import SectionHeader from "@/components/motion/SectionHeader";
import GrowReveal from "@/components/motion/GrowReveal";

export default function LabPreview() {
  return (
    <section
      aria-labelledby="lab-preview-heading"
      className="container py-16 sm:py-20"
    >
      <GrowReveal>
        <div className="grid items-center gap-8 rounded-dca-lg border border-brand-soft bg-gradient-to-br from-panel to-white p-6 shadow-soft-blue sm:p-9 lg:grid-cols-[1fr_auto] lg:p-12">
          <SectionHeader className="max-w-2xl">
            <p className="section-label">
              One real mission to try
            </p>
            <h2
              id="lab-preview-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              Try Coding Before You Enrol
            </h2>
            <p className="mt-4 text-lg leading-7 text-ink-2">
              Fix a discount calculation, run the checks, and see which skills
              your work demonstrates. This preview links to the mission that is
              available now.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="chip">
                JavaScript
              </span>
              <span className="chip">
                Beginner
              </span>
              <span className="chip">
                5–10 minutes
              </span>
            </div>
          </SectionHeader>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <TrackedLink
              href="/lab/javascript/discount-calculation-bug"
              event="cta_home_lab_start"
              eventParams={{ location: "home_lab_preview" }}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Start the challenge
            </TrackedLink>
            <TrackedLink
              href="/lab"
              event="cta_home_lab_explore"
              eventParams={{ location: "home_lab_preview" }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand bg-white px-5 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Explore DCA Lab
            </TrackedLink>
          </div>
        </div>
      </GrowReveal>
    </section>
  );
}
