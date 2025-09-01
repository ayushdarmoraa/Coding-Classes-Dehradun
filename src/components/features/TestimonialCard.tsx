import React from 'react';
import Card from '@/components/ui/Card';

interface TestimonialCardProps {
  name: string;
  role: string;
  company?: string;
  quote: string;
  image?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  name, 
  role, 
  company, 
  quote, 
  image 
}) => {
  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex-1 mb-4">
        <div className="text-blue-600 text-4xl mb-3">"</div>
        <p className="text-gray-700 leading-relaxed italic">
          {quote}
        </p>
      </div>
      
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">
            {role}{company && ` at ${company}`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;

