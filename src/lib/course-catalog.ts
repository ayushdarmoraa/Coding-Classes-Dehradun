import type { Course } from "./courses";

export const COURSE_PATHS = [
  { id: "all", label: "All courses" },
  { id: "beginner", label: "Beginner" },
  { id: "developer", label: "Developer" },
  { id: "data-ai", label: "Data & AI" },
] as const;

export type CoursePathId = (typeof COURSE_PATHS)[number]["id"];
export type CourseSortOrder = "recommended" | "duration" | "fees";
export type CourseLearningPath = Exclude<CoursePathId, "all">;

export function getCourseProjectDetails(course: Course): string[] {
  return [
    ...new Set([
      ...(course.projects ?? []),
      ...course.curriculum.filter((item) => /\bproject/i.test(item)),
      ...course.outcomes.filter((item) => /\bproject|portfolio|utilit/i.test(item)),
    ]),
  ];
}

export function getCourseLearningPath(course: Course): CourseLearningPath {
  const curriculum = course.curriculum.join(" ").toLowerCase();
  if (/data science|machine learning|pandas|statistics/.test(curriculum)) {
    return "data-ai";
  }
  if (/react|node\.js|express/.test(curriculum)) {
    return "developer";
  }
  return "beginner";
}

export function filterAndSortCourses(
  courses: readonly Course[],
  path: CoursePathId,
  sortOrder: CourseSortOrder,
): Course[] {
  const filtered =
    path === "all"
      ? [...courses]
      : courses.filter((course) => getCourseLearningPath(course) === path);

  if (sortOrder === "recommended") return filtered;

  return filtered
    .map((course, index) => ({ course, index }))
    .sort((left, right) => {
      const difference =
        sortOrder === "duration"
          ? left.course.duration.value - right.course.duration.value
          : left.course.pricing.packageRate - right.course.pricing.packageRate;
      return difference || left.index - right.index;
    })
    .map(({ course }) => course);
}
