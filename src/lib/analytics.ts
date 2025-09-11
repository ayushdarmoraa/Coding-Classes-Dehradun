// Generic GA parameter map (avoid 'any')
// Using unknown allows safe passing through to gtag / dataLayer without typing noise.
export type GAParams = Record<string, unknown>;

export function track(event: string, params: GAParams = {}): void {
  if (typeof window === "undefined") return; // SSR no-op
  // Prefer gtag if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") {
    // Cast params to unknown to satisfy spread acceptance inside gtag implementation.
    w.gtag("event", event, params as Record<string, unknown>);
    return;
  }
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  (w.dataLayer as unknown[]).push({ event, ...params });
}

export function derivePageContext(pathname: string): {
  page_type: string;
  course_slug: string;
  city: "dehradun" | "india" | "(unknown)";
} {
  const path = pathname.replace(/\/+/g, "/").replace(/\/$/, "");
  const segs = path.split("/").filter(Boolean);

  let page_type = "generic";
  let course_slug = "";
  let city: "dehradun" | "india" | "(unknown)" = "(unknown)";

  if (segs[0] === "courses" && segs[1]) {
    page_type = "course_detail";
    course_slug = segs[1];
    city = "dehradun";
  } else if (segs[0] === "online-courses" && segs[1]) {
    page_type = "online_course_detail";
    course_slug = segs[1];
    city = "india";
  } else if (segs[0] === "vs") {
    page_type = "comparison";
  } else if (segs[0] === "blog" && segs[1]) {
    page_type = "blog_post";
  } else if (segs[0] === "contact") {
    page_type = "contact";
  }

  return { page_type, course_slug, city };
}

// Convenience wrappers (domain-specific semantic events)
export function trackLeadClick(channel: 'phone' | 'whatsapp' | 'directions', extra: GAParams = {}) {
  track('lead_contact_click', { channel, ...extra });
}

export function trackEnrollClick(params: { page_type: string; course_slug?: string; city?: string; variant?: string }) {
  const { page_type, course_slug, city, variant } = params;
  track('cta_enroll_click', { page_type, course_slug, city, variant });
}

export function trackForm(step: 'start' | 'submit' | 'error', extra: GAParams = {}) {
  track(`lead_form_${step}`, extra);
}
