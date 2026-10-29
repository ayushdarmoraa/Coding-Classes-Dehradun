import TrackedLink from "@/components/analytics/TrackedLink";

const intents = [
  {
    number: "01",
    title: "Learn with Courses",
    description: "Compare structured programming, data and full-stack courses.",
    href: "/courses",
    action: "Explore Courses",
  },
  {
    number: "02",
    title: "Try DCA Lab",
    description: "Experience a real beginner-friendly coding challenge.",
    href: "/lab/javascript/discount-calculation-bug",
    action: "Start Free Challenge",
  },
  {
    number: "03",
    title: "Read Guides",
    description: "Explore published guides about coding and learning paths.",
    href: "/blog",
    action: "Browse Guides",
  },
  {
    number: "04",
    title: "Talk to the Academy",
    description: "Ask about course details and available learning modes.",
    href: "/contact",
    action: "Contact DCA",
  },
];

export default function IntentCards() {
  return (
    <section
      aria-labelledby="intent-heading"
      className="container py-16 sm:py-20"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">
            Find your next step
          </p>
          <h2
            id="intent-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            What would you like to do?
          </h2>
        </div>
        <p className="max-w-md leading-6 text-gray-600">
          Start with the path that fits what you want to learn today.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {intents.map((intent) => (
          <li key={intent.href}>
            <TrackedLink
              href={intent.href}
              event="cta_home_intent"
              eventParams={{ intent: intent.number }}
              className="surface-card group flex h-full min-h-52 flex-col p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-soft-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span className="font-mono text-sm font-semibold text-brand">
                {intent.number}
              </span>
              <span className="mt-4 text-lg font-bold text-ink">
                {intent.title}
              </span>
              <span className="mt-2 flex-1 leading-6 text-gray-600">
                {intent.description}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-dark">
                {intent.action}
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </TrackedLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
