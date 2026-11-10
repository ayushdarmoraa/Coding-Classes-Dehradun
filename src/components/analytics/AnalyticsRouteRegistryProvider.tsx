"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AnalyticsRouteRegistry } from "@/lib/analytics";

const AnalyticsRouteRegistryContext =
  createContext<AnalyticsRouteRegistry | undefined>(undefined);

export function AnalyticsRouteRegistryProvider({
  routes,
  children,
}: {
  routes: AnalyticsRouteRegistry;
  children: ReactNode;
}) {
  return (
    <AnalyticsRouteRegistryContext.Provider value={routes}>
      {children}
    </AnalyticsRouteRegistryContext.Provider>
  );
}

export function useAnalyticsRouteRegistry() {
  return useContext(AnalyticsRouteRegistryContext);
}
