import TrackedLink from "@/components/analytics/TrackedLink";
import SectionHeader from "@/components/motion/SectionHeader";
import GrowReveal from "@/components/motion/GrowReveal";

const paths = [
  {
    title: "I’m completely new",
    description: "Start with a beginner-friendly course or try the first mission.",
    href: "/courses/python",
    action: "Explore Python",
  },
  {
    title: "I want to build for the web",
    description: "Explore the Full-Stack course and its listed curriculum.",
    href: "/courses/full-stack",
    action: "Explore Full-Stack",
  },
  {
    title: "I’m interested in Data & AI",
    description: "Review the Data Science & AI course details and curriculum.",
    href: "/courses/data-science",
    action: "Explore Data Science & AI",
  },
  {
    title: "I already know the basics",
    description: "Try the available JavaScript debugging mission.",
    href: "/lab/javascript/discount-calculation-bug",
    action: "Try the challenge",
  },
];

export default function AudiencePaths() {
  return (
    <section
      aria-labelledby="audience-paths-heading"
      className="container py-16 sm:py-20"
    >
      <SectionHeader className="max-w-2xl">
        <p className="section-label">
          Choose a starting point
        </p>
        <h2
          id="audience-paths-heading"
          className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Where are you starting from?
        </h2>
      </SectionHeader>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {paths.map((path, index) => (
          <li key={path.title}>
            <GrowReveal delay={index * 0.1} className="h-full">
              <article className="surface-card flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <h3 className="text-lg font-bold text-ink">{path.title}</h3>
                  <p className="mt-2 max-w-md leading-6 text-ink-2">
                    {path.description}
                  </p>
                </div>
                <TrackedLink
                  href={path.href}
                  event="cta_home_audience_path"
                  eventParams={{ path: path.title }}
                  className="mt-5 inline-flex min-h-11 shrink-0 items-center font-semibold text-brand-dark underline decoration-brand/40 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:mt-0"
                >
                  {path.action}
                </TrackedLink>
              </article>
            </GrowReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
