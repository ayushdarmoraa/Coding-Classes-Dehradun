import React from 'react';
import type { CourseDuration, CoursePricing } from '@/lib/courses';
import { formatCourseDuration, formatINR } from '@/lib/pricing';

interface PricingDisplayProps {
  pricing: CoursePricing;
  duration: CourseDuration;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const PricingDisplay: React.FC<PricingDisplayProps> = ({ 
  pricing: coursePricing,
  duration, 
  className = '',
  layout = 'vertical'
}) => {
  const containerClass = layout === 'horizontal' 
    ? 'flex items-center space-x-4' 
    : 'space-y-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="pricing-option">
        <div className="text-2xl font-bold text-brand">
          {formatINR(coursePricing.packageRate)}
        </div>
        <div className="text-sm text-gray-600">
          {formatCourseDuration(duration)} package rate
        </div>
      </div>
      {coursePricing.monthlyRate !== undefined && (
        <>
          <div className="text-gray-400 text-sm">or</div>
          <div className="pricing-option">
            <div className="text-xl font-semibold text-gray-800">
              {formatINR(coursePricing.monthlyRate)}/month
            </div>
            <div className="text-sm text-gray-600">Monthly rate</div>
          </div>
        </>
      )}
      <div className="text-sm text-gray-500 font-medium">
        Duration: {formatCourseDuration(duration)}
      </div>
    </div>
  );
};

export default PricingDisplay;
