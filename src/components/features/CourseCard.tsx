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
  const cardClass = featured ? 'border-2 border-blue-200 bg-brand-soft-grad' : '';
  const courseContent = getCourseExperienceContent(course);
  
  return (
    <Card className={`p-6 flex flex-col justify-between ${cardClass}`} hover>
      <div>
        <h3 className="text-xl font-bold text-ink mb-2">
          {course.title}
        </h3>
        <p className="text-sm leading-6 text-gray-700">{course.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="chip border-blue-100 bg-brand-soft font-semibold text-brand-dark">
            {formatCourseDuration(course.duration)}
          </span>
          {course.level && (
            <span className="chip border-gray-200 bg-gray-50 font-semibold text-gray-700">
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
          className="bg-brand text-white hover:bg-brand-dark"
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
          className="btn-wa px-4 py-2 font-semibold transition hover:text-brand-dark"
        >
          WhatsApp
        </Button>
      </div>
    </Card>
  );
};

export default CourseCard;
