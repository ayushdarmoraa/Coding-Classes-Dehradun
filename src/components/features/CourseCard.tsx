import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PricingDisplay from '@/components/ui/PricingDisplay';
import { Course } from '@/lib/courses';

interface CourseCardProps {
  course: Course;
  featured?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, featured = false }) => {
  const cardClass = featured ? 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white' : '';
  
  return (
    <Card className={`p-6 h-full flex flex-col ${cardClass}`} hover>
      {featured && (
        <Badge variant="primary" className="self-start mb-4">
          Most Popular
        </Badge>
      )}
      
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {course.title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {course.description}
        </p>
        
        <div className="mb-4">
          <Badge variant="info" className="mr-2">
            {course.duration}
          </Badge>
          {course.slug === 'full-stack' && (
            <Badge variant="success">
              Gen AI Included
            </Badge>
          )}
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">What you'll learn:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {course.curriculum.slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {item}
              </li>
            ))}
            {course.curriculum.length > 3 && (
              <li className="text-blue-600 font-medium">
                +{course.curriculum.length - 3} more topics
              </li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <PricingDisplay 
          priceString={course.price} 
          duration={course.duration}
          className="mb-4"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            href={`/courses/${course.slug}`}
            variant="primary"
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            href={`https://wa.me/917037905464?text=Hi, I'm interested in the ${course.title} course`}
            variant="secondary"
            className="flex-1"
          >
            WhatsApp
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;

