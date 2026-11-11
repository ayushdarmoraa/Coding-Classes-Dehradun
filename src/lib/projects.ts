import { existsSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const routeSegmentSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const projectScreenshotSchema = z.object({
  src: z.string().min(1).optional(),
  alt: z.string().trim().min(1).max(200),
});
const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");
const assetPublicationPermissionSchema = z.enum([
  "unverified",
  "personal-project-owner-verified",
  "internship-organization-verified",
  "other-rightsholder-verified",
]);

export const projectSchema = z.object({
  slug: routeSegmentSchema,
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  origin: z.enum([
    "student",
    "instructor-demo",
    "dca-demo",
    "personal-project",
    "internship-project",
  ]),
  published: z.boolean(),
  assetPublicationPermission: assetPublicationPermissionSchema,
  category: z.string().trim().min(1).max(60),
  tags: z.array(z.string().trim().min(1).max(40)).min(1),
  problem: z.string().trim().min(1).max(1000),
  solution: z.string().trim().min(1).max(1000),
  technologies: z.array(z.string().trim().min(1).max(60)),
  features: z.array(z.string().trim().min(1).max(240)),
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
    if (
      screenshot.src &&
      !resolveProjectScreenshotPath(project.slug, screenshot.src)
    ) {
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
  if (
    project.published &&
    !hasVerifiedAssetPublicationPermission(project)
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Project assets require publication permission appropriate to their origin",
      path: ["assetPublicationPermission"],
    });
  }
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectOrigin = Project["origin"];

const projectRecords: unknown[] = [
  {
    slug: "e-commerce-website",
    title: "E-Commerce Website",
    summary:
      "A full-stack e-commerce web application designed to provide users with an online shopping experience, including product discovery and shopping workflows.",
    origin: "personal-project",
    published: false,
    assetPublicationPermission: "unverified",
    category: "Full-Stack Web Development",
    tags: ["Full-Stack Web Development"],
    problem: "Provides an online platform for users to explore and purchase products.",
    solution: "A web-based shopping experience with an integrated user interface.",
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js"],
    features: [],
    screenshots: [
      {
        src: "/projects/e-commerce-website/pro1.webp",
        alt: "E-Commerce Website screenshot 1",
      },
      {
        src: "/projects/e-commerce-website/pro2.webp",
        alt: "E-Commerce Website screenshot 2",
      },
    ],
    demoUrl: "https://e-commerce-seven-mu-27.vercel.app/",
    seo: {
      title: "E-Commerce Website",
      description:
        "A full-stack e-commerce web application for online product discovery and shopping workflows.",
    },
  },
  {
    slug: "ai-resume-builder",
    title: "AI Resume Builder",
    summary:
      "An AI-powered resume-building application intended to help users create and improve professional resumes.",
    origin: "personal-project",
    published: false,
    assetPublicationPermission: "unverified",
    category: "AI-Powered Web Application",
    tags: ["AI-Powered Web Application"],
    problem:
      "Creating a professional resume can be time-consuming and challenging.",
    solution:
      "A web-based interface to assist users in preparing resumes.",
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js"],
    features: [],
    screenshots: [
      {
        src: "/projects/ai-resume-builder/pro1.webp",
        alt: "AI Resume Builder screenshot 1",
      },
      {
        src: "/projects/ai-resume-builder/pro2.webp",
        alt: "AI Resume Builder screenshot 2",
      },
    ],
    demoUrl: "https://ai-resume-builder-omega-one.vercel.app/",
    seo: {
      title: "AI Resume Builder",
      description:
        "An AI-powered resume-building application intended to help users create and improve professional resumes.",
    },
  },
  {
    slug: "standupsync",
    title: "StandupSync",
    summary:
      "A MERN-stack productivity application designed to help teams manage standup updates, collaborate in real time, and understand team productivity.",
    origin: "internship-project",
    published: false,
    assetPublicationPermission: "unverified",
    category: "Full-Stack Productivity Application",
    tags: ["Full-Stack Productivity Application"],
    problem:
      "Managing team updates and tracking productivity across a team can become difficult.",
    solution:
      "A centralized productivity platform with real-time collaboration and AI-assisted insights.",
    technologies: [
      "MongoDB",
      "Express.js",
      "React.js",
      "Node.js",
      "Socket.io",
      "Gemini API",
    ],
    features: [
      "Real-time communication using Socket.io.",
      "AI-powered productivity insights.",
      "Weekly productivity summaries.",
      "Team standup and update management.",
    ],
    screenshots: [
      { src: "/projects/standupsync/pro1.webp", alt: "StandupSync screenshot 1" },
      { src: "/projects/standupsync/pro2.webp", alt: "StandupSync screenshot 2" },
    ],
    demoUrl: "https://standup-live.vercel.app/feed",
    seo: {
      title: "StandupSync | Internship Project",
      description:
        "A team productivity application for standup updates, real-time collaboration, and AI-assisted insights.",
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
  if (!screenshot.src) return false;
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

function hasVerifiedAssetPublicationPermission(project: Project): boolean {
  switch (project.origin) {
    case "personal-project":
      return (
        project.assetPublicationPermission ===
        "personal-project-owner-verified"
      );
    case "internship-project":
      return (
        project.assetPublicationPermission ===
        "internship-organization-verified"
      );
    default:
      return (
        project.assetPublicationPermission === "other-rightsholder-verified"
      );
  }
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
    hasVerifiedAssetPublicationPermission(project) &&
    project.summary.length > 0 &&
    project.problem.length > 0 &&
    project.solution.length > 0 &&
    project.technologies.length > 0 &&
    project.screenshots.length > 0 &&
    project.screenshots.every((screenshot) =>
      screenshotIsPresent(screenshot, project.slug),
    ) &&
    hasVerifiedContributorConsent(project)
  );
}

function hasVerifiedContributorConsent(project: Project): boolean {
  const studentConsent =
    project.origin !== "student" ||
    (project.contributors !== undefined &&
      project.contributors.length > 0 &&
      project.contributors.every(({ consentVerified }) => consentVerified));
  return (
    studentConsent &&
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

export function getProjectsForEnvironment(
  nodeEnvironment = process.env.NODE_ENV,
  records: readonly Project[] = PROJECTS,
): Project[] {
  return nodeEnvironment === "development"
    ? records.filter(
        (project) =>
          hasVerifiedContributorConsent(project) &&
          hasVerifiedAssetPublicationPermission(project),
      )
    : getPublishedProjects(records);
}

export function getProjectForEnvironment(
  slug: string,
  nodeEnvironment = process.env.NODE_ENV,
  records: readonly Project[] = PROJECTS,
): Project | undefined {
  if (!routeSegmentSchema.safeParse(slug).success) return undefined;
  return getProjectsForEnvironment(nodeEnvironment, records).find(
    (project) => project.slug === slug,
  );
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

export function getProjectOriginLabel(
  origin: ProjectOrigin,
): string | undefined {
  const labels: Partial<Record<ProjectOrigin, string>> = {
    student: "Student Project",
    "instructor-demo": "Instructor Demo",
    "dca-demo": "DCA Lab Demo",
    "personal-project": "Personal Project",
    "internship-project": "Internship Project",
  };
  return labels[origin];
}
