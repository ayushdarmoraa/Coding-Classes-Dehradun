"use client";
import React from 'react';
import { sanitizeAnalyticsParams, track } from '@/lib/analytics';
import Link from 'next/link';
import { useAnalyticsRouteRegistry } from '@/components/analytics/AnalyticsRouteRegistryProvider';

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
  onClick,
  ...props
}) => {
  const baseClasses = 'group inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-brand text-white hover:bg-brand-dark focus:ring-brand shadow-soft-blue',
    secondary: 'bg-white text-brand border border-brand hover:bg-brand-soft focus:ring-brand',
    ghost: 'text-brand hover:bg-brand-soft focus:ring-brand'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const routes = useAnalyticsRouteRegistry();
  const safeEventParams = event
    ? sanitizeAnalyticsParams(event, eventParams || {}, routes)
    : undefined;
  const safeEvent = safeEventParams ? event : undefined;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (event && safeEventParams) {
      try { track(event, safeEventParams); } catch { /* no-op */ }
    }
    if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement>);
  };

  if (href) {
    if (href.startsWith('/') && !href.startsWith('//')) {
      return (
        <Link
          href={href}
          className={classes}
          target={target}
          rel={rel}
          data-event={safeEvent}
          data-event-params={
            safeEventParams ? JSON.stringify(safeEventParams) : undefined
          }
          onClick={handleClick}
        >
          {children}
          {variant === 'primary' && (
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className={classes}
        target={target}
        rel={rel}
        data-event={safeEvent}
        data-event-params={
          safeEventParams ? JSON.stringify(safeEventParams) : undefined
        }
        onClick={handleClick}
      >
        {children}
        {variant === 'primary' && (
          <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </a>
    );
  }

  return (
    <button {...props} className={classes} onClick={handleClick}>
      {children}
      {variant === 'primary' && (
        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

export default Button;
