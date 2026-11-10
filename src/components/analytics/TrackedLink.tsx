"use client";
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { sanitizeAnalyticsParams, track } from '@/lib/analytics';
import { useAnalyticsRouteRegistry } from './AnalyticsRouteRegistryProvider';

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
  const routes = useAnalyticsRouteRegistry();
  const safeParams = sanitizeAnalyticsParams(event, eventParams || {}, routes);
  const safeEvent = safeParams ? event : undefined;
  const handleClick = () => {
    if (!safeParams) return;
    try { track(event, safeParams); } catch { /* swallow */ }
  };
  return (
    <Link
      {...linkProps}
      className={className}
      data-event={safeEvent}
      data-event-params={safeParams ? JSON.stringify(safeParams) : undefined}
      onClick={handleClick}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
};

export default TrackedLink;