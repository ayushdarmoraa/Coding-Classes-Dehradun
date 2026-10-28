import Link from "next/link";
import {
  getProjectOriginLabel,
  getProjectPath,
  type Project,
} from "@/lib/projects";
import ProjectScreenshot from "./ProjectScreenshot";

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <Link
        href={getProjectPath(project)}
        className="block rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        aria-label={`View ${project.title}`}
      >
        <ProjectScreenshot
          src={project.screenshots[0]?.src}
          alt={project.screenshots[0]?.alt ?? `${project.title} project preview`}
          className="rounded-none"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-blue-800">
          {getProjectOriginLabel(project.origin)} · {project.category}
        </p>
        <h2 className="mt-2 text-xl font-bold text-gray-900">
          <Link
            href={getProjectPath(project)}
            className="rounded-sm hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            {project.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technology tags">
          {project.technologies.map((technology) => (
            <li
              key={technology}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900"
            >
              {technology}
            </li>
          ))}
        </ul>
        <Link
          href={getProjectPath(project)}
          className="mt-5 inline-flex w-fit rounded-lg font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        >
          View project
        </Link>
      </div>
    </article>
  );
}
