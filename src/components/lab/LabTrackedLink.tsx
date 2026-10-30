"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { LabChallengeContext } from "@/lib/analytics";
import {
  createLabIndexImpressionTracker,
  LabAnalyticsSession,
  recordLabLinkClick,
  type LabLinkAction,
} from "@/lib/lab/analytics-session";

type LabTrackedLinkProps = LabLinkAction & {
  href: string;
  className?: string;
  children: ReactNode;
};

export function LabTrackedLink(props: LabTrackedLinkProps) {
  const { href, className, children } = props;
  const action: LabLinkAction =
    props.event === "course"
      ? {
          event: props.event,
          context: props.context,
          relatedCourseSlug: props.relatedCourseSlug,
        }
      : { event: props.event, context: props.context };

  return (
    <Link
      href={href}
      className={className}
      onClick={() => recordLabLinkClick(action)}
    >
      {children}
    </Link>
  );
}

export function LabPageImpression({
  context,
}: {
  context: LabChallengeContext;
}) {
  const pathname = usePathname();
  const trackIndexImpression = useMemo(
    () =>
      createLabIndexImpressionTracker({
        challengeSlug: context.challengeSlug,
        track: context.track,
        difficulty: context.difficulty,
      }),
    [context.challengeSlug, context.track, context.difficulty],
  );

  useEffect(() => {
    trackIndexImpression(pathname);
  }, [pathname, trackIndexImpression]);

  return null;
}

export function LabChallengeImpression({
  context,
}: {
  context: LabChallengeContext;
}) {
  const session = useMemo(
    () =>
      new LabAnalyticsSession({
        challengeSlug: context.challengeSlug,
        track: context.track,
        difficulty: context.difficulty,
      }),
    [context.challengeSlug, context.track, context.difficulty],
  );

  useEffect(() => {
    session.pageImpression();
  }, [session]);

  return null;
}
