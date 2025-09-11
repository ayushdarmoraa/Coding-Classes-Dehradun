"use client";
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { track } from '@/lib/analytics';

interface TrackedLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  event: string;
  eventParams?: Record<string, unknown>;
  target?: string;
  rel?: string;
}

export const TrackedLink: React.FC<TrackedLinkProps> = ({
  children,
  event,
  eventParams,
  className,
  target,
  rel,
  ...linkProps
}) => {
  const handleClick = () => {
    try { track(event, eventParams || {}); } catch { /* swallow */ }
  };
  return (
    <Link {...linkProps} className={className} onClick={handleClick} target={target} rel={rel}>
      {children}
    </Link>
  );
};

export default TrackedLink;