import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbLd } from "@/lib/seo";
import { SITE } from "@/lib/site-config";
import {
  getProjectOriginLabel,
  getProjectPath,
  type Project,
} from "@/lib/projects";
import { getCourseBySlug } from "@/lib/courses";
import { getChallengePath } from "@/lib/lab/challenge-utils";
import { getPublishedChallenges } from "@/lib/lab/challenges";
import ProjectScreenshot from "./ProjectScreenshot";

type Props = {
  project: Project;
};

export default function ProjectDetail({ project }: Props) {
  const projectPath = getProjectPath(project);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: project.title, href: projectPath },
  ];
  const breadcrumbSchema = breadcrumbLd(
    breadcrumbs.map(({ label, href }) => ({
      name: label,
      url: `${SITE.url}${href === "/" ? "/" : href}`,
    })),
  );
  const relatedCourse = project.courseSlug
    ? {
        href: `/courses/${project.courseSlug}`,
        label: getCourseBySlug(project.courseSlug)?.shortTitle,
      }
    : undefined;
  const relatedChallengeRecord = project.challengeSlug
    ? getPublishedChallenges().find(
        ({ track, slug }) =>
          track === project.challengeSlug?.track &&
          slug === project.challengeSlug.slug,
      )
    : undefined;
  const relatedChallenge = relatedChallengeRecord
    ? getChallengePath(relatedChallengeRecord)
    : undefined;

  return (
    <main className="container mx-auto min-h-screen py-8">
      <Breadcrumbs items={breadcrumbs} />
      <script
        id="project-breadcrumb"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-blue-800">
            {getProjectOriginLabel(project.origin)
              ? `${getProjectOriginLabel(project.origin)} · `
              : ""}
            {project.category}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-950 sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-gray-700">
            {project.summary}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Project tags">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-900"
              >
                {tag}
              </li>
            ))}
          </ul>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {project.screenshots.map((screenshot, index) => (
            <ProjectScreenshot
              key={`${project.slug}-screenshot-${index + 1}`}
              projectSlug={project.slug}
              src={screenshot.src}
              alt={screenshot.alt}
            />
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
          <div className="space-y-8">
            <section aria-labelledby="project-problem-heading">
              <h2 id="project-problem-heading" className="text-2xl font-bold">
                Problem
              </h2>
              <p className="mt-2 leading-7 text-gray-700">{project.problem}</p>
            </section>
            <section aria-labelledby="project-solution-heading">
              <h2 id="project-solution-heading" className="text-2xl font-bold">
                Solution
              </h2>
              <p className="mt-2 leading-7 text-gray-700">{project.solution}</p>
            </section>
            {project.features.length > 0 && (
              <section aria-labelledby="project-features-heading">
                <h2 id="project-features-heading" className="text-2xl font-bold">
                  Features
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-gray-700">
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))
                  }
                </ul>
              </section>
            )}
            {project.technicalApproach && (
              <section aria-labelledby="project-approach-heading">
                <h2 id="project-approach-heading" className="text-2xl font-bold">
                  Technical approach
                </h2>
                <p className="mt-2 leading-7 text-gray-700">
                  {project.technicalApproach}
                </p>
              </section>
            )}
            {project.lessons && project.lessons.length > 0 && (
              <section aria-labelledby="project-lessons-heading">
                <h2 id="project-lessons-heading" className="text-2xl font-bold">
                  Challenges and lessons
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-gray-700">
                  {project.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
              </section>
            )}
            {project.contributors?.some(({ consentVerified }) => consentVerified) && (
              <section aria-labelledby="project-contributors-heading">
                <h2
                  id="project-contributors-heading"
                  className="text-2xl font-bold"
                >
                  Contributors
                </h2>
                <ul className="mt-3 list-disc pl-6 text-gray-700">
                  {project.contributors
                    .filter(({ consentVerified }) => consentVerified)
                    .map(({ name }) => <li key={name}>{name}</li>)}
                </ul>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200">
            <section aria-labelledby="project-technology-heading">
              <h2
                id="project-technology-heading"
                className="text-lg font-bold text-gray-900"
              >
                Technologies
              </h2>
              {project.technologies.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-full bg-white px-3 py-1 text-sm text-gray-800 ring-1 ring-gray-200"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {(project.demoUrl || project.repositoryUrl) && (
              <section
                className="mt-6 border-t border-gray-200 pt-5"
                aria-labelledby="project-links-heading"
              >
                <h2 id="project-links-heading" className="text-lg font-bold">
                  Project links
                </h2>
                <ul className="mt-3 space-y-2">
                  {project.demoUrl && (
                    <li>
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-800 underline hover:text-blue-950"
                      >
                        Open live demo (opens in a new tab)
                      </a>
                    </li>
                  )}
                  {project.repositoryUrl && (
                    <li>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-800 underline hover:text-blue-950"
                      >
                        View source repository (opens in a new tab)
                      </a>
                    </li>
                  )}
                </ul>
              </section>
            )}

            {(relatedChallenge || relatedCourse) && (
              <section
                className="mt-6 border-t border-gray-200 pt-5"
                aria-labelledby="project-learning-heading"
              >
                <h2 id="project-learning-heading" className="text-lg font-bold">
                  Related learning
                </h2>
                <ul className="mt-3 space-y-2">
                  {relatedChallenge && (
                    <li>
                      <Link
                        href={relatedChallenge}
                        className="font-medium text-blue-800 underline hover:text-blue-950"
                      >
                        Try a related DCA Lab challenge
                      </Link>
                    </li>
                  )}
                  {relatedCourse?.label && (
                    <li>
                      <Link
                        href={relatedCourse.href}
                        className="font-medium text-blue-800 underline hover:text-blue-950"
                      >
                        Explore {relatedCourse.label}
                      </Link>
                    </li>
                  )}
                </ul>
              </section>
            )}
          </aside>
        </div>

        <nav className="mt-10 border-t border-gray-200 pt-6" aria-label="Project navigation">
          <Link
            href="/projects"
            className="font-semibold text-blue-800 underline hover:text-blue-950"
          >
            Back to all projects
          </Link>
        </nav>
      </article>
    </main>
  );
}
