import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Course } from '@/lib/courses';
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from '@/lib/pricing';
import { getCourseExperienceContent } from '@/lib/course-experience-content';
import { SITE } from '@/lib/site-config';

interface CourseCardProps {
  course: Course;
  featured?: boolean;
  relatedChallengeHref?: string;
  analyticsLocation?: string;
  showProjectSummary?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  featured = false,
  relatedChallengeHref,
  analyticsLocation,
  showProjectSummary = false,
}) => {
  const cardClass = featured ? 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white' : '';
  const courseContent = getCourseExperienceContent(course);
  
  return (
    <Card className={`p-6 flex flex-col justify-between ${cardClass}`} hover>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {course.title}
        </h3>
        <p className="text-sm leading-6 text-gray-700">{course.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
            {formatCourseDuration(course.duration)}
          </span>
          {course.level && (
            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
              {course.level}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-600">
          Explore the listed curriculum to see what the course covers.
        </p>
        <p className="mt-3 text-sm font-semibold text-gray-800">
          Fees: {formatCoursePrice(course.pricing)}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Delivery: {formatCourseModes(course)}
        </p>
        <p className="mt-3 text-sm font-semibold text-gray-800">Topics covered</p>
        <ul className="mt-1 space-y-1 text-sm text-gray-600">
          {course.curriculum.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
        {showProjectSummary && (
          <>
            <p className="mt-3 text-sm font-semibold text-gray-800">Practical work</p>
            <p className="mt-1 text-sm text-gray-600">
              {courseContent.projectSummary}
            </p>
          </>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          href={`/courses/${course.slug}`}
          event={analyticsLocation ? "cta_home_course_details" : undefined}
          eventParams={
            analyticsLocation
              ? { location: analyticsLocation, course_slug: course.slug }
              : undefined
          }
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          View Course
        </Button>
        {relatedChallengeHref && (
          <Button href={relatedChallengeHref} variant="secondary">
            Try Related Challenge
          </Button>
        )}
        <Button
          href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hi, I'm interested in the ${course.title} course`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          WhatsApp
        </Button>
      </div>
    </Card>
  );
};

export default CourseCard;
