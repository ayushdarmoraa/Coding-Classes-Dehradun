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
        <div className="font-mono text-2xl font-bold text-brand-dark">
          {formatINR(coursePricing.packageRate)}
        </div>
        <div className="text-sm text-ink-2">
          {formatCourseDuration(duration)} package rate
        </div>
      </div>
      {coursePricing.monthlyRate !== undefined && (
        <>
          <div className="text-sm text-ink-3">or</div>
          <div className="pricing-option">
            <div className="font-mono text-xl font-semibold text-ink">
              {formatINR(coursePricing.monthlyRate)}/month
            </div>
            <div className="text-sm text-ink-2">Monthly rate</div>
          </div>
        </>
      )}
      <div className="font-mono text-sm font-medium text-ink-2">
        Duration: {formatCourseDuration(duration)}
      </div>
    </div>
  );
};

export default PricingDisplay;
