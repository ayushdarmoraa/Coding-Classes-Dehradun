import Link from "next/link";

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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Find your next step
          </p>
          <h2
            id="intent-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
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
            <Link
              href={intent.href}
              className="group flex h-full min-h-52 flex-col rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              <span className="text-sm font-semibold text-blue-700">
                {intent.number}
              </span>
              <span className="mt-4 text-lg font-bold text-gray-950">
                {intent.title}
              </span>
              <span className="mt-2 flex-1 leading-6 text-gray-600">
                {intent.description}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-800">
                {intent.action}
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
