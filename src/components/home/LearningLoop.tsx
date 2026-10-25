const steps = [
  {
    number: "01",
    title: "Learn",
    description: "Follow a course curriculum with a clear sequence of topics.",
  },
  {
    number: "02",
    title: "Debug",
    description: "Practice reasoning through a real coding problem in the Lab.",
  },
  {
    number: "03",
    title: "Build",
    description: "Apply concepts through the curriculum and course work described on each course page.",
  },
  {
    number: "04",
    title: "Prove",
    description: "Review the checks passed and skills demonstrated in a completed mission.",
  },
];

export default function LearningLoop() {
  return (
    <section
      aria-labelledby="learning-loop-heading"
      className="bg-blue-950 py-16 text-white sm:py-20"
    >
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
            The DCA learning loop
          </p>
          <h2
            id="learning-loop-heading"
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Learn. Debug. Build. Prove.
          </h2>
          <p className="mt-4 leading-7 text-blue-100">
            Connect structured study with practical work and visible evidence of
            what you have practiced.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-white/15 bg-white/[0.06] p-5"
            >
              <span className="font-mono text-sm text-blue-200">
                {step.number}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-6 hidden text-blue-300 lg:block"
                >
                  →
                </span>
              )}
              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
