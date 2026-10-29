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
  const baseClasses = 'inline-flex min-h-11 items-center justify-center font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand shadow-sm hover:shadow-md',
    secondary: 'bg-white text-brand-dark border border-brand hover:bg-brand-soft focus-visible:ring-brand',
    ghost: 'text-brand-dark hover:bg-brand-soft focus-visible:ring-brand'
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
        {...(event
          ? {
              "data-event": event,
              "data-event-params": JSON.stringify(eventParams || {}),
            }
          : {})}
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
