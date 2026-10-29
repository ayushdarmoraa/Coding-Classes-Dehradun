import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const baseClasses = 'chip';
  
  const variantClasses = {
    primary: 'text-brand-dark',
    secondary: 'text-ink-2',
    success: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
