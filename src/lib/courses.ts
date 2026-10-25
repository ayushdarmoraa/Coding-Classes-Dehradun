import { z } from "zod";

export const COURSE_LEVELS = [
  "Beginner",
  "Advanced Beginner",
  "Beginner to Intermediate",
  "Intermediate",
] as const;
export const LEARNING_STAGES = [
  "Beginner",
  "Advanced Beginner",
  "Beginner to Intermediate",
] as const;
export const courseLevelSchema = z.enum(COURSE_LEVELS);

export const COURSE_MODES = ["On-Campus", "Online", "Hybrid"] as const;
export const COURSE_MODE_STATUSES = ["confirmed", "temporary"] as const;

export const courseDurationSchema = z.object({
  value: z.number().int().positive(),
  unit: z.literal("months"),
});

export const coursePricingSchema = z.object({
  packageRate: z.number().finite().nonnegative(),
  monthlyRate: z.number().finite().nonnegative().optional(),
  currency: z.literal("INR"),
});

export const courseSchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  shortTitle: z.string().trim().min(1),
  description: z.string().trim().min(1),
  level: courseLevelSchema,
  duration: courseDurationSchema,
  pricing: coursePricingSchema,
  modes: z.array(z.enum(COURSE_MODES)).min(1),
  modeStatus: z.enum(COURSE_MODE_STATUSES),
  prerequisites: z.array(z.string().trim().min(1)),
  curriculum: z.array(z.string().trim().min(1)).min(1),
  outcomes: z.array(z.string().trim().min(1)),
  projects: z.array(z.string().trim().min(1)).optional(),
  relatedLabTrack: z.string().trim().min(1).optional(),
});

export type Course = z.infer<typeof courseSchema>;
export type CourseDuration = z.infer<typeof courseDurationSchema>;
export type CoursePricing = z.infer<typeof coursePricingSchema>;
export type CourseLevel = (typeof COURSE_LEVELS)[number];
export type CourseMode = (typeof COURSE_MODES)[number];
export type CourseModeStatus = (typeof COURSE_MODE_STATUSES)[number];

const courseRecords: unknown[] = [
  {
    id: "1",
    slug: "full-stack",
    title: "Full-Stack Development (MERN + Gen AI)",
    shortTitle: "Full-Stack Development",
    description:
      "Modern full-stack program covering HTML/CSS/JS, React, Node.js, Express, MongoDB, Git/GitHub, deployments, and Gen AI integrations.",
    level: "Beginner to Intermediate",
    duration: { value: 6, unit: "months" },
    pricing: { packageRate: 25000, monthlyRate: 5000, currency: "INR" },
    modes: ["On-Campus", "Online", "Hybrid"],
    modeStatus: "confirmed",
    curriculum: [
      "HTML, CSS, Tailwind fundamentals",
      "Modern JavaScript (ES202x) & TypeScript basics",
      "React + Hooks, Routing, State management",
      "Node.js, Express APIs, MongoDB",
      "Auth, security, validation",
      "Gen AI APIs (prompting, simple RAG)",
      "Project, Git/GitHub, deployment (Vercel)",
    ],
    prerequisites: ["Basic computer skills", "Motivation to learn"],
    outcomes: [
      "Build full-stack apps end-to-end",
      "Deploy production projects",
      "Portfolio with 2–3 projects",
    ],
  },
  {
    id: "2",
    slug: "data-science",
    title: "Data Science & AI",
    shortTitle: "Data Science & AI",
    description:
      "Python for data analysis, statistics, ML algorithms, model evaluation, and practical AI workflows.",
    level: "Beginner to Intermediate",
    duration: { value: 6, unit: "months" },
    pricing: { packageRate: 30000, monthlyRate: 6000, currency: "INR" },
    modes: ["On-Campus", "Online", "Hybrid"],
    modeStatus: "confirmed",
    curriculum: [
      "Python, NumPy, Pandas",
      "Data cleaning & visualization",
      "Stats & probability basics",
      "ML algorithms (regression, trees, clustering)",
      "Model evaluation & tuning",
      "Intro to Gen AI & LLM tooling",
    ],
    prerequisites: ["Basic math", "Comfort with learning Python"],
    outcomes: [
      "Analyze datasets & build ML models",
      "Create notebooks & reports",
      "Mini capstone project",
    ],
  },
  {
    id: "3",
    slug: "python",
    title: "Python Programming",
    shortTitle: "Python",
    description:
      "Start-to-pro Python: syntax, data structures, OOP, file/JSON work, and small projects.",
    level: "Beginner to Intermediate",
    duration: { value: 4, unit: "months" },
    pricing: { packageRate: 12000, monthlyRate: 4000, currency: "INR" },
    modes: ["On-Campus", "Online", "Hybrid"],
    modeStatus: "confirmed",
    curriculum: [
      "Python basics & data types",
      "Control flow, functions, modules",
      "Lists, dicts, sets",
      "OOP & error handling",
      "Files, JSON, simple CLI projects",
    ],
    prerequisites: ["No prior coding required"],
    outcomes: [
      "Write clean Python scripts",
      "Understand OOP & modules",
      "Build small utilities",
    ],
  },
  {
    id: "4",
    slug: "java",
    title: "Java Programming",
    shortTitle: "Java",
    description:
      "Core Java foundations: syntax, OOP, collections, exceptions, and intro to Spring basics.",
    level: "Beginner to Intermediate",
    duration: { value: 4, unit: "months" },
    pricing: { packageRate: 12000, monthlyRate: 4000, currency: "INR" },
    modes: ["On-Campus", "Online", "Hybrid"],
    modeStatus: "confirmed",
    curriculum: [
      "Java syntax & tooling",
      "OOP, interfaces, packages",
      "Collections & generics",
      "Exceptions & IO",
      "Intro to Spring basics",
    ],
    prerequisites: ["No prior coding required"],
    outcomes: [
      "Strong Java fundamentals",
      "OOP problem-solving",
      "Starter backend knowledge",
    ],
  },
];

export const coursesSchema = z
  .array(courseSchema)
  .superRefine((records, context) => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    records.forEach((course, index) => {
      if (seenIds.has(course.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate course id: ${course.id}`,
          path: [index, "id"],
        });
      }
      seenIds.add(course.id);

      if (seenSlugs.has(course.slug)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate course slug: ${course.slug}`,
          path: [index, "slug"],
        });
      }
      seenSlugs.add(course.slug);
    });
  });

export function validateCourses(records: unknown): Course[] {
  return coursesSchema.parse(records);
}

const courses = validateCourses(courseRecords);

export function getCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function isCourseModeAvailable(course: Course, mode: CourseMode): boolean {
  return course.modeStatus === "confirmed" && course.modes.includes(mode);
}
