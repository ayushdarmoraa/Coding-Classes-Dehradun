import React from 'react';
import { parsePricing, type PricingInfo } from '@/lib/pricing';

interface PricingDisplayProps {
  priceString: string;
  duration: string;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const PricingDisplay: React.FC<PricingDisplayProps> = ({ 
  priceString, 
  duration, 
  className = '',
  layout = 'vertical'
}) => {
  const pricing = parsePricing(priceString, duration);
  
  if (pricing.oneTime === 0) {
    return (
      <div className={`text-gray-600 ${className}`}>
        <span className="text-lg font-semibold">{priceString}</span>
      </div>
    );
  }

  const containerClass = layout === 'horizontal' 
    ? 'flex items-center space-x-4' 
    : 'space-y-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="pricing-option">
        <div className="text-2xl font-bold text-blue-600">
          {pricing.currency}{pricing.oneTime.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">One-time payment</div>
      </div>
      
      <div className="text-gray-400 text-sm">or</div>
      
      <div className="pricing-option">
        <div className="text-xl font-semibold text-gray-800">
          {pricing.currency}{pricing.monthly.toLocaleString()}/month
        </div>
        <div className="text-sm text-gray-600">Monthly installments</div>
      </div>
      
      <div className="text-sm text-gray-500 font-medium">
        Duration: {duration}
      </div>
    </div>
  );
};

export default PricingDisplay;

