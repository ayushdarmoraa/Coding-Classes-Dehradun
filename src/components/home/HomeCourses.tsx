"use client";

import CourseCard from "@/components/features/CourseCard";
import GrowReveal from "@/components/motion/GrowReveal";
import Carousel from "@/components/ui/Carousel";
import type { Course } from "@/lib/courses";

export default function HomeCourses({ courses }: { courses: Course[] }) {
  return (
    <Carousel ariaLabel="Course previews">
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="cf-slide min-w-0"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${courses.length}`}
        >
          <GrowReveal className="h-full">
            <CourseCard
              course={course}
              featured={index === 0}
              analyticsLocation="home_course_preview"
            />
          </GrowReveal>
        </div>
      ))}
    </Carousel>
  );
}
