import { existsSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const routeSegmentSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const projectScreenshotSchema = z.object({
  src: z.string().min(1),
  alt: z.string().trim().min(1).max(200),
});
const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");

export const projectSchema = z.object({
  slug: routeSegmentSchema,
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  origin: z.enum(["student", "instructor-demo", "dca-demo", "personal-project"]),
  published: z.boolean(),
  category: z.string().trim().min(1).max(60),
  tags: z.array(z.string().trim().min(1).max(40)).min(1),
  problem: z.string().trim().min(1).max(1000),
  solution: z.string().trim().min(1).max(1000),
  technologies: z.array(z.string().trim().min(1).max(60)).min(1),
  features: z.array(z.string().trim().min(1).max(240)).min(1),
  screenshots: z.array(projectScreenshotSchema),
  technicalApproach: z.string().trim().min(1).max(1200).optional(),
  lessons: z.array(z.string().trim().min(1).max(300)).optional(),
  contributors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        consentVerified: z.boolean(),
      }),
    )
    .optional(),
  demoUrl: httpsUrlSchema.optional(),
  repositoryUrl: httpsUrlSchema.optional(),
  courseSlug: routeSegmentSchema.optional(),
  challengeSlug: z
    .object({
      track: routeSegmentSchema,
      slug: routeSegmentSchema,
    })
    .optional(),
  seo: z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(320),
  }),
}).superRefine((project, context) => {
  project.screenshots.forEach((screenshot, index) => {
    if (!resolveProjectScreenshotPath(project.slug, screenshot.src)) {
      context.addIssue({
        code: "custom",
        message:
          "Screenshots must use a local image path inside their project slug directory",
        path: ["screenshots", index, "src"],
      });
    }
  });

  const missingStudentConsent =
    project.origin === "student" && !project.contributors?.length;
  const unverifiedContributor =
    project.contributors?.some(({ consentVerified }) => !consentVerified) ??
    false;
  if (project.published && (missingStudentConsent || unverifiedContributor)) {
    context.addIssue({
      code: "custom",
      message: "Identifiable contributors require verified consent",
      path: ["contributors"],
    });
  }
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectOrigin = Project["origin"];

const projectRecords: unknown[] = [
  {
    slug: "ai-resume-builder",
    title: "AI Resume Builder",
    summary:
      "A personal web application for creating and managing resumes, with an API feature that generates professional summaries using Gemini.",
    origin: "personal-project",
    published: false,
    category: "Resume tools",
    tags: ["React", "Node.js", "MongoDB", "AI-assisted writing"],
    problem:
      "The application supports creating and managing resume content and generating a professional summary from supplied text.",
    solution:
      "A React interface works with an Express API for resume operations and a Gemini-powered summary-generation endpoint.",
    technologies: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "Gemini API",
    ],
    features: [
      "Create, retrieve, update, and delete resumes through the API",
      "Store resume sections including experience, education, skills, and projects",
      "Generate a professional resume summary from supplied text using Gemini",
    ],
    screenshots: [],
    technicalApproach:
      "The repository contains a React/Vite frontend, an Express API, Mongoose resume and user models, and a Gemini summary-generation endpoint.",
    courseSlug: "full-stack",
    seo: {
      title: "AI Resume Builder | Personal Project",
      description:
        "A personal project exploring a React resume interface, an Express API, MongoDB persistence, and Gemini-powered summary generation.",
    },
  },
];

export const PROJECTS: readonly Project[] = Object.freeze(
  validateProjects(projectRecords),
);

// Product decision: keep the gallery unpublished until it can show a useful
// three-card set, matching the visualization's lower bound without treating it
// as a numeric requirement stated by the implementation plan.
export const MIN_PUBLISHED_PROJECTS = 3;

export function validateProjects(records: unknown): Project[] {
  const parsed = z.array(projectSchema).parse(records);
  const slugs = new Set<string>();

  for (const project of parsed) {
    if (slugs.has(project.slug)) {
      throw new Error(`Duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);
  }

  return parsed;
}

function screenshotExists(
  screenshot: Project["screenshots"][number],
  projectSlug: string,
  publicDirectory: string,
): boolean {
  const resolvedPath = resolveProjectScreenshotPath(
    projectSlug,
    screenshot.src,
    publicDirectory,
  );
  if (!resolvedPath || !existsSync(resolvedPath)) return false;

  const projectDirectory = path.resolve(publicDirectory, "projects", projectSlug);
  const projectsDirectory = path.resolve(publicDirectory, "projects");
  const realProjectDirectory = realpathSync(projectDirectory);
  const realProjectsDirectory = realpathSync(projectsDirectory);
  const expectedRealProjectDirectory = path.resolve(
    realProjectsDirectory,
    projectSlug,
  );
  const realScreenshotPath = realpathSync(resolvedPath);
  return (
    path.relative(expectedRealProjectDirectory, realProjectDirectory) === "" &&
    path.relative(realProjectDirectory, expectedRealProjectDirectory) === "" &&
    isStrictlyInside(realProjectDirectory, realScreenshotPath) &&
    statSync(realScreenshotPath).isFile()
  );
}

function isStrictlyInside(directory: string, candidate: string): boolean {
  const relativePath = path.relative(directory, candidate);
  return (
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

export function resolveProjectScreenshotPath(
  projectSlug: string,
  screenshotSrc: string,
  publicDirectory = path.resolve(process.cwd(), "public"),
): string | undefined {
  if (
    !routeSegmentSchema.safeParse(projectSlug).success ||
    screenshotSrc.includes("\\") ||
    screenshotSrc.includes("%") ||
    screenshotSrc.includes("?") ||
    screenshotSrc.includes("#")
  ) {
    return undefined;
  }

  const expectedPrefix = `/projects/${projectSlug}/`;
  if (!screenshotSrc.startsWith(expectedPrefix)) return undefined;

  const filename = screenshotSrc.slice(expectedPrefix.length);
  if (
    filename.includes("/") ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/i.test(filename)
  ) {
    return undefined;
  }

  const projectDirectory = path.resolve(publicDirectory, "projects", projectSlug);
  const resolvedPath = path.resolve(
    publicDirectory,
    "projects",
    projectSlug,
    filename,
  );
  return isStrictlyInside(projectDirectory, resolvedPath)
    ? resolvedPath
    : undefined;
}

function hasPublishableContent(
  project: Project,
  screenshotIsPresent: (
    screenshot: Project["screenshots"][number],
    projectSlug: string,
  ) => boolean,
): boolean {
  return (
    project.published &&
    project.summary.length > 0 &&
    project.problem.length > 0 &&
    project.solution.length > 0 &&
    project.technologies.length > 0 &&
    project.screenshots.length > 0 &&
    project.screenshots.every((screenshot) =>
      screenshotIsPresent(screenshot, project.slug),
    ) &&
    (project.origin !== "student" ||
      (project.contributors !== undefined &&
        project.contributors.length > 0 &&
        project.contributors.every(({ consentVerified }) => consentVerified))) &&
    project.contributors?.every(({ consentVerified }) => consentVerified) !==
      false
  );
}

export function getPublishedProjects(
  records: readonly Project[] = PROJECTS,
  publicDirectory = path.resolve(process.cwd(), "public"),
  screenshotIsPresent = (
    screenshot: Project["screenshots"][number],
    projectSlug: string,
  ) => screenshotExists(screenshot, projectSlug, publicDirectory),
): Project[] {
  const eligible = records.filter((project) =>
    hasPublishableContent(project, screenshotIsPresent),
  );

  return eligible.length >= MIN_PUBLISHED_PROJECTS ? eligible : [];
}

export function getPublishedProjectBySlug(
  slug: string,
  records: readonly Project[] = PROJECTS,
  publicDirectory = path.resolve(process.cwd(), "public"),
  screenshotIsPresent = (
    screenshot: Project["screenshots"][number],
    projectSlug: string,
  ) => screenshotExists(screenshot, projectSlug, publicDirectory),
): Project | undefined {
  if (!routeSegmentSchema.safeParse(slug).success) return undefined;
  return getPublishedProjects(records, publicDirectory, screenshotIsPresent).find(
    (project) => project.slug === slug,
  );
}

export function getProjectTags(
  records: readonly Project[] = getPublishedProjects(),
): string[] {
  return Array.from(
    new Set(records.flatMap(({ category, tags }) => [category, ...tags])),
  ).sort((a, b) => a.localeCompare(b));
}

export function getProjectsByTag(
  tag: string | undefined,
  records: readonly Project[] = getPublishedProjects(),
): Project[] {
  if (!tag) return [...records];
  return records.filter(
    (project) => project.category === tag || project.tags.includes(tag),
  );
}

export function getProjectPath(project: Pick<Project, "slug">): string {
  const slug = routeSegmentSchema.parse(project.slug);
  return `/projects/${slug}`;
}

export function getProjectOriginLabel(origin: ProjectOrigin): string {
  const labels: Record<ProjectOrigin, string> = {
    student: "Student Project",
    "instructor-demo": "Instructor Demo",
    "dca-demo": "DCA Lab Demo",
    "personal-project": "Personal Project",
  };
  return labels[origin];
}
