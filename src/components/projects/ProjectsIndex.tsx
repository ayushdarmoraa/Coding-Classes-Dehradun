import Link from "next/link";
import ProjectCard from "./ProjectCard";
import ProjectTagFilter from "./ProjectTagFilter";
import {
  getProjectTags,
  getProjectsByTag,
  type Project,
} from "@/lib/projects";

type Props = {
  projects: Project[];
  selectedTag?: string;
  localPreview?: boolean;
};

export default function ProjectsIndex({
  projects,
  selectedTag,
  localPreview = false,
}: Props) {
  const tags = getProjectTags(projects);
  const filteredProjects = getProjectsByTag(selectedTag, projects);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pt-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
          Practical work
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-950 sm:text-4xl">
          Projects built through practice
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-gray-700">
          Explore verified projects and the technologies behind them. Each
          project is described using its provided purpose, technologies, and
          learning links.
        </p>
      </header>

      <section
        className="mx-auto max-w-6xl px-4 pb-12"
        aria-labelledby="project-list-heading"
      >
        <h2 id="project-list-heading" className="sr-only">
          Project library
        </h2>
        <ProjectTagFilter tags={tags} selectedTag={selectedTag} />
        {filteredProjects.length > 0 ? (
          <ul className="mt-6 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <li key={project.slug}>
                <ProjectCard
                  project={project}
                  showPendingRepository={localPreview || !project.repositoryUrl}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl bg-white p-5 text-gray-700 ring-1 ring-gray-200">
            No projects match that tag.{" "}
            <Link href="/projects" className="font-semibold text-blue-800 underline">
              Show all projects
            </Link>
          </p>
        )}
      </section>

      <section
        className="border-y border-gray-200 bg-white py-10"
        aria-labelledby="learning-heading"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="learning-heading" className="text-2xl font-bold text-gray-900">
            Learning through building
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-gray-700">
            A project can make concepts visible: what it is designed to do,
            which technologies it uses, and how its parts fit together. Project
            origins are identified clearly so personal work, demonstrations,
            and student work are not confused.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex rounded-sm font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            Explore courses
          </Link>
        </div>
      </section>
    </main>
  );
}
