"use client";
import React from 'react';
import { track } from '@/lib/analytics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  event?: string;                // analytics event name
  eventParams?: Record<string, unknown>; // analytics params
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  href,
  target,
  rel,
  className = '',
  event,
  eventParams,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (event) {
      try { track(event, eventParams || {}); } catch { /* no-op */ }
    }
    if (props.onClick) props.onClick(e as React.MouseEvent<HTMLButtonElement>);
  };

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target={target}
        rel={rel}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export default Button;

