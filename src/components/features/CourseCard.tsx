import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Course } from '@/lib/courses';
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from '@/lib/pricing';
import { SITE } from '@/lib/site-config';

interface CourseCardProps {
  course: Course;
  featured?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, featured = false }) => {
  const cardClass = featured ? 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white' : '';
  
  return (
    <Card className={`p-6 flex flex-col justify-between ${cardClass}`} hover>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {course.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
            {formatCourseDuration(course.duration)}
          </span>
          {course.level && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
              {course.level}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-800">{formatCoursePrice(course.pricing)}</p>
        <p className="mt-1 text-xs text-gray-600">
          Delivery: {formatCourseModes(course)}
        </p>
        <ul className="mt-3 text-sm text-gray-600 space-y-1">
          {course.curriculum.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button href={`/courses/${course.slug}`} className="bg-blue-600 text-white hover:bg-blue-700">
          View Details
        </Button>
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
