"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  createCanonicalPageViewTracker,
  type AnalyticsRouteRegistry,
} from "@/lib/analytics";

export default function GaPageViewTracker({
  measurementId,
  routes,
}: {
  measurementId: string;
  routes: AnalyticsRouteRegistry;
}) {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);
  const trackPageView = useMemo(
    () => createCanonicalPageViewTracker(measurementId, routes),
    [measurementId, routes],
  );

  useEffect(() => {
    if (!pathname || lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    const sendPageView = () => trackPageView(pathname);
    if (window.__DCA_GA_READY__) {
      sendPageView();
      return;
    }

    window.addEventListener("dca:ga-ready", sendPageView, { once: true });
    return () => window.removeEventListener("dca:ga-ready", sendPageView);
  }, [pathname, trackPageView]);

  return null;
}
