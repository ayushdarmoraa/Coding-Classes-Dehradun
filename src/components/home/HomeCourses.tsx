"use client";

import { useState } from "react";
import Carousel from "@/components/ui/Carousel";
import CourseCard from "@/components/features/CourseCard";
import Tabs from "@/components/ui/Tabs";
import type { Course, CourseMode } from "@/lib/courses";
import { isCourseModeAvailable } from "@/lib/courses";

const courseModes: Array<CourseMode | "All Courses"> = [
  "All Courses",
  "On-Campus",
  "Online",
  "Hybrid",
];

export default function HomeCourses({ courses }: { courses: Course[] }) {
  const [activeMode, setActiveMode] = useState<CourseMode | "All Courses">("All Courses");
  const filteredCourses = courses.filter((course) =>
    activeMode === "All Courses" || isCourseModeAvailable(course, activeMode),
  );

  return (
    <>
      <div className="relative z-10 mt-8">
        <Tabs
          activeTab={activeMode}
          onChange={(mode) => {
            const selectedMode = courseModes.find((availableMode) => availableMode === mode);
            if (selectedMode) setActiveMode(selectedMode);
          }}
          tabs={courseModes.map((mode) => ({ id: mode, label: mode }))}
        />
      </div>
      <div className="mt-6">
        <Carousel ariaLabel="Course previews">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="cf-slide min-w-0"
            >
              <CourseCard
                course={course}
                featured={index === 0}
                analyticsLocation="home_course_preview"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
}
