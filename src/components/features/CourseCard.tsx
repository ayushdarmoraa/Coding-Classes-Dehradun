import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Course } from '@/lib/courses';

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
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
          {course.duration}
        </span>
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
          href={`https://wa.me/917037905464?text=Hi, I'm interested in the ${course.title} course`}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          WhatsApp
        </Button>
      </div>
    </Card>
  );
};

export default CourseCard;

