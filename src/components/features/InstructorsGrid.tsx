import Image from "next/image";
import { INSTRUCTORS, Instructor } from "@/lib/instructors";

function InstructorCard({ i }: { i: Instructor }) {
  return (
    <article className="rounded-2xl border shadow-sm p-5 bg-white/70 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {i.photo ? (
            <Image
              src={i.photo}
              alt=""
              aria-hidden="true"
              role="presentation"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full grid place-items-center text-gray-500 text-sm"
            >
              No Photo
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{i.name}</h3>
          <p className="text-sm text-gray-600">{i.title}</p>
          <p className="mt-2 text-sm">{i.bio}</p>
          {i.expertise?.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {i.expertise.map((tag) => (
                <li
                  key={tag}
                  className="text-xs rounded-full border px-2 py-1 text-gray-700 bg-white"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex gap-3">
            {i.linkedin && (
              <a
                href={i.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
                aria-label={`Open ${i.name}'s LinkedIn in a new tab`}
              >
                LinkedIn
              </a>
            )}
            {i.github && (
              <a
                href={i.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
                aria-label={`Open ${i.name}'s GitHub in a new tab`}
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function InstructorsGrid() {
  return (
    <section aria-labelledby="instructors-heading" className="mt-10">
      <div className="mb-6">
        <h2 id="instructors-heading" className="text-2xl md:text-3xl font-bold">
          Meet Your Instructors
        </h2>
        <p className="mt-1 text-gray-600">
          Learn from engineers and practitioners who build what they teach.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INSTRUCTORS.map((i) => (
          <InstructorCard key={i.id} i={i} />
        ))}
      </div>
    </section>
  );
}
