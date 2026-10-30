"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/features/CourseCard";
import {
  COURSE_PATHS,
  filterAndSortCourses,
  type CoursePathId,
  type CourseSortOrder,
} from "@/lib/course-catalog";
import type { Course } from "@/lib/courses";
import {
  formatCourseDuration,
  formatCourseModes,
  formatCoursePrice,
} from "@/lib/pricing";

type CourseCatalogProps = {
  courses: Course[];
  relatedChallengeHrefs: Readonly<Record<string, string>>;
};

export default function CourseCatalog({
  courses,
  relatedChallengeHrefs,
}: CourseCatalogProps) {
  const [path, setPath] = useState<CoursePathId>("all");
  const [sortOrder, setSortOrder] = useState<CourseSortOrder>("recommended");
  const visibleCourses = useMemo(
    () => filterAndSortCourses(courses, path, sortOrder),
    [courses, path, sortOrder],
  );

  return (
    <>
      <section
        className="mx-auto max-w-6xl px-4 py-10"
        aria-labelledby="learning-path-heading"
      >
        <h2 id="learning-path-heading" className="text-2xl font-bold">
          Choose Your Learning Path
        </h2>
        <p className="mt-2 max-w-3xl text-gray-700">
          Browse by the course focus, then compare the curriculum and
          prerequisites to find a suitable starting point.
        </p>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter courses by learning path"
        >
          {COURSE_PATHS.map((coursePath) => (
            <button
              key={coursePath.id}
              type="button"
              onClick={() => setPath(coursePath.id)}
              aria-pressed={path === coursePath.id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                path === coursePath.id
                  ? "border-brand bg-brand text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:border-brand hover:bg-brand-soft"
              }`}
            >
              {coursePath.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Sort courses:
          </span>
          <button
            type="button"
            onClick={() => setSortOrder("recommended")}
            aria-pressed={sortOrder === "recommended"}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Recommended order
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("duration")}
            aria-pressed={sortOrder === "duration"}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Shortest duration
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("fees")}
            aria-pressed={sortOrder === "fees"}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Lowest fees
          </button>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-10"
        id="all-courses"
        aria-label="Course options"
      >
        <p className="sr-only" aria-live="polite">
          Showing {visibleCourses.length} courses
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              relatedChallengeHref={relatedChallengeHrefs[course.slug]}
              showProjectSummary
            />
          ))}
        </div>
        {visibleCourses.length === 0 && (
          <p className="mt-4 text-gray-700">
            No courses match this learning path.
          </p>
        )}
      </section>

      <section
        className="bg-panel py-12"
        id="comparison"
        aria-labelledby="course-comparison-heading"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="course-comparison-heading" className="text-2xl font-bold">
            Compare Courses
          </h2>
          <p className="mt-2 text-gray-700">
            Course details below follow the same selection and order as the
            course cards.
          </p>
          <div
            className="mt-5 overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            role="region"
            aria-label="Scrollable course comparison"
            tabIndex={0}
          >
            <table className="w-full min-w-[42rem] overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm">
              <caption className="sr-only">Course comparison</caption>
              <thead className="bg-navy-grad text-white">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Fees</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Course focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleCourses.map((course) => (
                  <tr key={course.id}>
                    <th scope="row" className="px-4 py-3 font-semibold">
                      {course.shortTitle}
                    </th>
                    <td className="px-4 py-3">{course.level}</td>
                    <td className="px-4 py-3">
                      {formatCourseDuration(course.duration)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCoursePrice(course.pricing)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCourseModes(course)}
                    </td>
                    <td className="px-4 py-3">{course.outcomes[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
