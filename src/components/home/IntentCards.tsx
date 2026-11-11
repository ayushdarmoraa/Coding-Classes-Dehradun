import TrackedLink from "@/components/analytics/TrackedLink";
import Carousel from "@/components/ui/Carousel";
import SectionHeader from "@/components/motion/SectionHeader";
import GrowReveal from "@/components/motion/GrowReveal";
import { getPublishedProjects } from "@/lib/projects";

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
  ...(getPublishedProjects().length > 0
    ? [
        {
          number: "05",
          title: "Explore Projects",
          description:
            "Review published project examples, technologies, and the ideas behind each build.",
          href: "/projects",
          action: "Browse Projects",
        },
      ]
    : []),
];

export default function IntentCards() {
  const cards = intents.map((intent, index) => (
    <div
      key={intent.href}
      className="min-w-0 flex-[0_0_88%] pl-3 sm:flex-[0_0_65%]"
    >
      <GrowReveal delay={index * 0.08} className="h-full">
        <TrackedLink
          href={intent.href}
          event="cta_home_intent"
          eventParams={{ intent: intent.number }}
          className="group surface-card flex h-full min-h-52 flex-col p-6 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <span className="font-mono text-sm font-semibold text-brand-dark">
            {intent.number}
          </span>
          <span className="mt-4 text-lg font-bold text-ink">
            {intent.title}
          </span>
          <span className="mt-2 flex-1 leading-6 text-ink-2">
            {intent.description}
          </span>
          <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-dark">
            {intent.action}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </TrackedLink>
      </GrowReveal>
    </div>
  ));

  return (
    <section
      aria-labelledby="intent-heading"
      className="container py-16 sm:py-20"
    >
      <SectionHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
        <p className="max-w-md leading-6 text-ink-2">
          Start with the path that fits what you want to learn today.
        </p>
      </SectionHeader>
      <div className="mt-8 md:hidden">
        <Carousel ariaLabel="Ways to get started">{cards}</Carousel>
      </div>
      <ul className="mt-8 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {intents.map((intent, index) => (
          <li key={intent.href} className="h-full">
            <GrowReveal delay={index * 0.1} className="h-full">
              <TrackedLink
                href={intent.href}
                event="cta_home_intent"
                eventParams={{ intent: intent.number }}
                className="group surface-card flex h-full min-h-52 flex-col p-6 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="font-mono text-sm font-semibold text-brand-dark">
                  {intent.number}
                </span>
                <span className="mt-4 text-lg font-bold text-ink">{intent.title}</span>
                <span className="mt-2 flex-1 leading-6 text-ink-2">{intent.description}</span>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-dark">
                  {intent.action}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </TrackedLink>
            </GrowReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
