// Generic GA parameter map (avoid 'any')
// Using unknown allows safe passing through to gtag / dataLayer without typing noise.
import { PUBLISHED_LAB_ANALYTICS_METADATA } from "./lab/analytics-metadata";

export type GAParams = Record<string, unknown>;

export type AnalyticsRouteRegistry = Readonly<{
  courseSlugs: readonly string[];
  guideSlugs: readonly string[];
  challengeSlugs: readonly string[];
  challengeIds: readonly string[];
  labTracks: readonly string[];
  citySlugs: readonly string[];
  canonicalPaths: readonly string[];
  siteUrl?: string;
}>;

declare global {
  interface Window {
    __DCA_ANALYTICS_ROUTES__?: AnalyticsRouteRegistry;
    __DCA_GA_READY__?: boolean;
    gtag?: (...args: unknown[]) => void;
  }
}

const SAFE_ROUTE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ATTEMPT_NUMBER = 10000;
const MAX_HINT_LEVEL = 5;

const EVENT_PARAMS: Readonly<Record<string, readonly string[]>> = {
  page_view: ["page_location", "page_path", "page_referrer"],
  lead_contact_click: ["channel", "page_type", "course_slug", "city", "variant", "page_path"],
  cta_enroll_click: ["page_type", "course_slug", "city", "variant", "location"],
  lead_form_start: ["page_type", "course_slug", "city", "page_path"],
  lead_form_submit: [
    "page_type",
    "course_slug",
    "city",
    "page_path",
    "has_message",
    "field_errors",
  ],
  lead_form_error: [
    "page_type",
    "course_slug",
    "city",
    "page_path",
    "error_origin",
    "field_errors",
    "has_message",
  ],
  dca_lab_attempt: ["challenge_id"],
  dca_lab_hint_view: ["challenge_id", "hint_level"],
  dca_lab_completed: ["challenge_id"],
  cta_home_try_challenge: ["location"],
  cta_home_explore_courses: ["location"],
  cta_home_view_all_courses: ["location"],
  cta_home_intent: ["intent"],
  cta_home_audience_path: ["path"],
  cta_home_lab_start: ["location"],
  cta_home_lab_explore: ["location"],
  cta_home_view_guides: ["location"],
  cta_home_read_guide: ["guide_slug"],
  cta_home_course_details: ["location", "course_slug"],
  cta_related_challenge: ["course_slug"],
  lab_impression: ["challenge_slug", "track", "difficulty", "page_path"],
  lab_start: ["challenge_slug", "track", "difficulty", "page_path"],
  lab_first_edit: ["challenge_slug", "track", "difficulty", "page_path"],
  lab_run: ["challenge_slug", "track", "difficulty", "page_path", "attempt_number"],
  lab_test_result: [
    "challenge_slug",
    "track",
    "difficulty",
    "page_path",
    "attempt_number",
    "completed",
  ],
  lab_hint_open: ["challenge_slug", "track", "difficulty", "page_path", "hint_level"],
  lab_reset: ["challenge_slug", "track", "difficulty", "page_path"],
  lab_complete: [
    "challenge_slug",
    "track",
    "difficulty",
    "page_path",
    "attempt_number",
    "completed",
  ],
  lab_skill_map_view: ["challenge_slug", "track", "difficulty", "page_path"],
  lab_course_click: [
    "challenge_slug",
    "track",
    "difficulty",
    "page_path",
    "related_course_slug",
  ],
  lab_contact_click: ["challenge_slug", "track", "difficulty", "page_path"],
};

const SAFE_PAGE_TYPES = new Set([
  "generic",
  "contact",
  "course_detail",
  "online_course_detail",
  "comparison",
  "blog_post",
  "lab_index",
  "lab_challenge",
  "location_page",
  "offline_course",
  "vs_page",
  "online_course",
  "course",
  "blog",
  "locations",
  "home",
]);
const SAFE_CITIES = new Set(["dehradun", "india", "(unknown)", "Dehradun"]);
const SAFE_CHANNELS = new Set(["phone", "whatsapp", "directions"]);
const SAFE_VARIANTS = new Set([
  "visit_campus_hero",
  "schedule_visit",
  "visit_campus_footer",
  "hero_online",
  "hero_whatsapp",
  "inline_online_crosslink",
  "hero_consultation",
  "hero_online_crosslink_button",
  "online_course_details",
  "final_course_consultation",
  "conclusion_primary",
  "post_body_primary_online",
  "post_body_secondary_guide",
  "body_primary",
  "body_secondary",
  "conclusion",
  "hero_primary",
  "hero_secondary_oncampus",
  "cohort_card_primary",
  "cohort_card_faq",
]);
const SAFE_LOCATIONS = new Set([
  "home_course_preview",
  "home_final_cta",
  "home_lab_preview",
  "home_hero",
  "home_hero_preview",
  "home_guide_preview",
  "course_detail",
]);
const SAFE_AUDIENCE_PATHS = new Set([
  "I’m completely new",
  "I want to build for the web",
  "I’m interested in Data & AI",
  "I already know the basics",
]);
const SAFE_FORM_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "course",
  "message",
  "website",
  "source",
  "challenge",
  "track",
  "relatedCourse",
]);

function isAllowedSlug(
  value: unknown,
  slugs: readonly string[] | undefined,
): value is string {
  return (
    typeof value === "string" &&
    SAFE_ROUTE_SEGMENT.test(value) &&
    Boolean(slugs?.includes(value))
  );
}

function getAnalyticsRouteRegistry(): AnalyticsRouteRegistry {
  const configured =
    typeof window === "undefined" ? undefined : window.__DCA_ANALYTICS_ROUTES__;
  if (configured) return configured;

  const publishedLabs = PUBLISHED_LAB_ANALYTICS_METADATA.filter(
    ({ status }) => status === "published",
  );
  return {
    courseSlugs: [],
    guideSlugs: [],
    challengeSlugs: publishedLabs.map(({ slug }) => slug),
    challengeIds: publishedLabs.map(({ id }) => id),
    labTracks: publishedLabs.map(({ track }) => track),
    citySlugs: [],
    canonicalPaths: [
      "/lab",
      ...publishedLabs.map(({ track, slug }) => `/lab/${track}/${slug}`),
    ],
  };
}

function canonicalAnalyticsPath(
  value: unknown,
  routes: AnalyticsRouteRegistry,
): string | undefined {
  if (
    typeof value !== "string" ||
    /[?#%\\\u0000-\u001f]/.test(value) ||
    !value.startsWith("/")
  ) {
    return undefined;
  }
  const normalized = value.replace(/\/+$/, "") || "/";
  if (/\/{2,}/.test(normalized)) return undefined;
  return routes.canonicalPaths.includes(normalized) ? normalized : undefined;
}

function canonicalPageLocation(
  value: unknown,
  routes: AnalyticsRouteRegistry,
): string | undefined {
  if (typeof value !== "string" || !routes.siteUrl) return undefined;
  let site: URL;
  let location: URL;
  try {
    site = new URL(routes.siteUrl);
    location = new URL(value);
  } catch {
    return undefined;
  }
  if (
    site.protocol !== "https:" ||
    site.username ||
    site.password ||
    site.pathname !== "/" ||
    site.search ||
    site.hash ||
    location.origin !== site.origin ||
    location.search ||
    location.hash
  ) {
    return undefined;
  }
  const path = canonicalAnalyticsPath(location.pathname, routes);
  return path ? `${site.origin}${path}` : undefined;
}

export function getCanonicalAnalyticsPath(
  pathname: string,
  routes: AnalyticsRouteRegistry,
): string | undefined {
  if (typeof pathname !== "string" || /[?#%\\\u0000-\u001f]/.test(pathname)) {
    return undefined;
  }
  return canonicalAnalyticsPath(pathname, routes);
}

export function createCanonicalPageViewTracker(
  measurementId: string,
  routes: AnalyticsRouteRegistry,
): (pathname: string) => void {
  let lastPathname: string | undefined;

  return (pathname) => {
    if (pathname === lastPathname || typeof window === "undefined") return;
    const gtag = window.gtag;
    if (typeof gtag !== "function") return;
    lastPathname = pathname;

    const safePath = getCanonicalAnalyticsPath(pathname, routes);
    const pagePath = safePath ?? "/";
    const pageLocation = canonicalPageLocation(
      `${routes.siteUrl ?? ""}${pagePath}`,
      routes,
    );
    if (!pageLocation) return;

    gtag("config", measurementId, {
      send_page_view: false,
      page_location: pageLocation,
      page_path: pagePath,
      page_referrer: "",
    });
    if (!safePath) return;
    track("page_view", {
      page_location: pageLocation,
      page_path: pagePath,
      page_referrer: "",
    });
  };
}

function isValidAnalyticsValue(
  key: string,
  value: unknown,
  routes: AnalyticsRouteRegistry | undefined,
): boolean {
  switch (key) {
    case "page_type":
      return typeof value === "string" && SAFE_PAGE_TYPES.has(value);
    case "course_slug":
      return value === "(none)" || isAllowedSlug(value, routes?.courseSlugs);
    case "related_course_slug":
      return (
        isAllowedSlug(value, routes?.courseSlugs) ||
        PUBLISHED_LAB_ANALYTICS_METADATA.some(
          ({ relatedCourseSlug, status }) =>
            status === "published" && relatedCourseSlug === value,
        )
      );
    case "guide_slug":
      return isAllowedSlug(value, routes?.guideSlugs);
    case "challenge_slug":
      return isAllowedSlug(value, routes?.challengeSlugs);
    case "challenge_id":
      return (
        typeof value === "string" &&
        SAFE_ROUTE_SEGMENT.test(value) &&
        Boolean(
          routes?.challengeIds.includes(value) ||
            PUBLISHED_LAB_ANALYTICS_METADATA.some(
              ({ id, status }) => status === "published" && id === value,
            ),
        )
      );
    case "track":
      return (
        isAllowedSlug(value, routes?.labTracks) ||
        PUBLISHED_LAB_ANALYTICS_METADATA.some(
          ({ track, status }) => status === "published" && track === value,
        )
      );
    case "city":
      return (
        typeof value === "string" &&
        (SAFE_CITIES.has(value) || Boolean(routes?.citySlugs.includes(value)))
      );
    case "channel":
      return typeof value === "string" && SAFE_CHANNELS.has(value);
    case "variant":
      return typeof value === "string" && SAFE_VARIANTS.has(value);
    case "location":
      return typeof value === "string" && SAFE_LOCATIONS.has(value);
    case "path":
      return typeof value === "string" && SAFE_AUDIENCE_PATHS.has(value);
    case "intent":
      return typeof value === "string" && /^0[1-5]$/.test(value);
    case "page_path":
      return canonicalAnalyticsPath(value, routes ?? getAnalyticsRouteRegistry()) !==
        undefined;
    case "page_location":
      return canonicalPageLocation(value, routes ?? getAnalyticsRouteRegistry()) !==
        undefined;
    case "page_referrer":
      return value === "";
    case "difficulty":
      return value === "Beginner" || value === "Intermediate" || value === "Advanced";
    case "attempt_number":
      return (
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        value >= 1 &&
        value <= MAX_ATTEMPT_NUMBER
      );
    case "hint_level":
      return (
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        value >= 1 &&
        value <= MAX_HINT_LEVEL
      );
    case "completed":
    case "has_message":
      return typeof value === "boolean";
    case "error_origin":
      return value === "validation" || value === "server";
    case "field_errors":
      return (
        Array.isArray(value) &&
        value.every(
          (field) => typeof field === "string" && SAFE_FORM_FIELDS.has(field),
        )
      );
    default:
      return false;
  }
}

export function sanitizeAnalyticsParams(
  event: string,
  params: GAParams = {},
  routesOverride?: AnalyticsRouteRegistry,
): GAParams | undefined {
  const allowedKeys = EVENT_PARAMS[event];
  if (
    !allowedKeys ||
    !params ||
    typeof params !== "object" ||
    Array.isArray(params)
  ) {
    return undefined;
  }

  const routes = routesOverride ?? getAnalyticsRouteRegistry();
  const safe: GAParams = {};
  for (const key of allowedKeys) {
    const value = params[key];
    if (key === "field_errors" && Array.isArray(value)) {
      const fieldErrors = value.filter(
        (field) => typeof field === "string" && SAFE_FORM_FIELDS.has(field),
      );
      if (fieldErrors.length > 0) safe[key] = fieldErrors;
    } else if (key === "page_path") {
      const canonicalPath = canonicalAnalyticsPath(value, routes);
      if (canonicalPath) safe[key] = canonicalPath;
    } else if (isValidAnalyticsValue(key, value, routes)) {
      safe[key] = value;
    }
  }
  if (event === "page_view" && (!safe.page_location || !safe.page_path)) {
    return undefined;
  }
  return safe;
}

export function track(event: string, params: GAParams = {}): void {
  if (typeof window === "undefined") return; // SSR no-op
  const safeParams = sanitizeAnalyticsParams(event, params);
  if (!safeParams) return;
  // Prefer gtag if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") {
    // Cast params to unknown to satisfy spread acceptance inside gtag implementation.
    w.gtag("event", event, safeParams as Record<string, unknown>);
    return;
  }
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  (w.dataLayer as unknown[]).push({ event, ...safeParams });
}

/** Accepts only a pathname; query strings and fragments are rejected. */
export function derivePageContext(pathname: string): {
  page_type: string;
  course_slug: string;
  city: "dehradun" | "india" | "(unknown)";
} {
  if (typeof pathname !== "string" || /[?#]/.test(pathname)) {
    return { page_type: "generic", course_slug: "", city: "(unknown)" };
  }

  if (/[#?%\\\u0000-\u001f]/.test(pathname)) {
    return { page_type: "generic", course_slug: "", city: "(unknown)" };
  }
  const routes = getAnalyticsRouteRegistry();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (/\/{2,}/.test(path)) {
    return { page_type: "generic", course_slug: "", city: "(unknown)" };
  }
  if (!routes?.canonicalPaths.includes(path)) {
    return { page_type: "generic", course_slug: "", city: "(unknown)" };
  }
  const segs = path.split("/").filter(Boolean);

  let page_type = "generic";
  let course_slug = "";
  let city: "dehradun" | "india" | "(unknown)" = "(unknown)";

  if (segs[0] === "courses" && isAllowedSlug(segs[1], routes.courseSlugs)) {
    page_type = "course_detail";
    course_slug = segs[1];
    city = "dehradun";
  } else if (
    segs[0] === "online-courses" &&
    isAllowedSlug(segs[1], routes.courseSlugs)
  ) {
    page_type = "online_course_detail";
    course_slug = segs[1];
    city = "india";
  } else if (segs[0] === "vs" && ["coding-ninjas", "scaler"].includes(segs[1])) {
    page_type = "comparison";
  } else if (segs[0] === "blog" && isAllowedSlug(segs[1], routes.guideSlugs)) {
    page_type = "blog_post";
  } else if (segs[0] === "contact") {
    page_type = "contact";
  } else if (path === "/lab") {
    page_type = "lab_index";
  } else if (PUBLISHED_LAB_ANALYTICS_METADATA.some(
    ({ track, slug, status }) =>
      status === "published" && path === `/lab/${track}/${slug}`,
  )) {
    page_type = "lab_challenge";
  }

  return { page_type, course_slug, city };
}

// Convenience wrappers (domain-specific semantic events)
export function trackLeadClick(channel: 'phone' | 'whatsapp' | 'directions', extra: GAParams = {}) {
  track('lead_contact_click', { ...extra, channel });
}

export function trackWhatsAppEnquiryClick(pathname: string): void {
  const context = derivePageContext(pathname);
  trackLeadClick("whatsapp", { ...context, page_path: pathname });
}

export function trackEnrollClick(params: { page_type: string; course_slug?: string; city?: string; variant?: string }) {
  const { page_type, course_slug, city, variant } = params;
  track('cta_enroll_click', { page_type, course_slug, city, variant });
}

function safeFormAnalyticsParams(extra: GAParams): GAParams {
  const safe: GAParams = {};
  const allowedFormKeys = new Set([
    ...EVENT_PARAMS.lead_form_start,
    ...EVENT_PARAMS.lead_form_submit,
    ...EVENT_PARAMS.lead_form_error,
  ]);
  for (const key of allowedFormKeys) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) safe[key] = extra[key];
  }
  return safe;
}

export function trackForm(step: 'start' | 'submit' | 'error', extra: GAParams = {}) {
  track(`lead_form_${step}`, safeFormAnalyticsParams(extra));
}

export function trackLabAttempt(challengeId: string): void {
  track("dca_lab_attempt", { challenge_id: challengeId });
}

export function trackLabHintView(challengeId: string, hintLevel: number): void {
  track("dca_lab_hint_view", {
    challenge_id: challengeId,
    hint_level: hintLevel,
  });
}

export function trackLabCompletion(challengeId: string): void {
  track("dca_lab_completed", { challenge_id: challengeId });
}

export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LabChallengeContext = Readonly<{
  challengeSlug: string;
  track: string;
  difficulty: LabDifficulty;
}>;

function isPublishedLabContext(
  context: LabChallengeContext,
): boolean {
  if (!context || typeof context !== "object") return false;
  return PUBLISHED_LAB_ANALYTICS_METADATA.some(
    (metadata) =>
      metadata.status === "published" &&
      context.challengeSlug === metadata.slug &&
      context.track === metadata.track &&
      context.difficulty === metadata.difficulty &&
      SAFE_ROUTE_SEGMENT.test(context.challengeSlug) &&
      SAFE_ROUTE_SEGMENT.test(context.track),
  );
}

function isValidPositiveInteger(value: number, maximum: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= maximum;
}

function getSafeLabPagePath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const pathname = window.location.pathname;
  if (typeof pathname !== "string" || /[?#]/.test(pathname)) return undefined;

  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/lab") return normalized;
  return PUBLISHED_LAB_ANALYTICS_METADATA.some(
    ({ track, slug, status }) =>
      status === "published" &&
      normalized === `/lab/${track}/${slug}`,
  )
    ? normalized
    : undefined;
}

function labEventParams(
  context: LabChallengeContext,
  additional?: Readonly<{
    attempt_number?: number;
    hint_level?: number;
    completed?: boolean;
    related_course_slug?: string;
  }>,
): GAParams | undefined {
  if (!isPublishedLabContext(context)) return undefined;
  if (
    additional?.attempt_number !== undefined &&
    !isValidPositiveInteger(additional.attempt_number, MAX_ATTEMPT_NUMBER)
  ) {
    return undefined;
  }
  if (
    additional?.hint_level !== undefined &&
    !isValidPositiveInteger(additional.hint_level, MAX_HINT_LEVEL)
  ) {
    return undefined;
  }
  if (
    additional?.completed !== undefined &&
    typeof additional.completed !== "boolean"
  ) {
    return undefined;
  }
  if (
    additional?.related_course_slug !== undefined &&
    (additional.related_course_slug !==
      PUBLISHED_LAB_ANALYTICS_METADATA.find(
        ({ slug }) => slug === context.challengeSlug,
      )?.relatedCourseSlug ||
      !SAFE_ROUTE_SEGMENT.test(additional.related_course_slug))
  ) {
    return undefined;
  }

  const pagePath = getSafeLabPagePath();
  return {
    challenge_slug: context.challengeSlug,
    track: context.track,
    difficulty: context.difficulty,
    ...(pagePath ? { page_path: pagePath } : {}),
    ...(additional?.attempt_number === undefined
      ? {}
      : { attempt_number: additional.attempt_number }),
    ...(additional?.hint_level === undefined
      ? {}
      : { hint_level: additional.hint_level }),
    ...(additional?.completed === undefined
      ? {}
      : { completed: additional.completed }),
    ...(additional?.related_course_slug === undefined
      ? {}
      : { related_course_slug: additional.related_course_slug }),
  };
}

function trackLabEvent(event: string, params: GAParams | undefined): void {
  if (params) track(event, params);
}

export function trackLabImpression(context: LabChallengeContext): void {
  trackLabEvent("lab_impression", labEventParams(context));
}

export function trackLabStart(context: LabChallengeContext): void {
  trackLabEvent("lab_start", labEventParams(context));
}

export function trackLabFirstEdit(context: LabChallengeContext): void {
  trackLabEvent("lab_first_edit", labEventParams(context));
}

export function trackLabRun(
  context: LabChallengeContext,
  attemptNumber: number,
): void {
  trackLabEvent(
    "lab_run",
    labEventParams(context, { attempt_number: attemptNumber }),
  );
}

export function trackLabTestResult(
  context: LabChallengeContext,
  attemptNumber: number,
  completed: boolean,
): void {
  trackLabEvent(
    "lab_test_result",
    labEventParams(context, {
      attempt_number: attemptNumber,
      completed,
    }),
  );
}

export function trackLabHintOpen(
  context: LabChallengeContext,
  hintLevel: number,
): void {
  trackLabEvent(
    "lab_hint_open",
    labEventParams(context, { hint_level: hintLevel }),
  );
}

export function trackLabReset(context: LabChallengeContext): void {
  trackLabEvent("lab_reset", labEventParams(context));
}

export function trackLabComplete(
  context: LabChallengeContext,
  attemptNumber: number,
): void {
  trackLabEvent(
    "lab_complete",
    labEventParams(context, {
      attempt_number: attemptNumber,
      completed: true,
    }),
  );
}

export function trackLabSkillMapView(context: LabChallengeContext): void {
  trackLabEvent("lab_skill_map_view", labEventParams(context));
}

export function trackLabCourseClick(
  context: LabChallengeContext,
  relatedCourseSlug: string,
): void {
  trackLabEvent(
    "lab_course_click",
    labEventParams(context, { related_course_slug: relatedCourseSlug }),
  );
}

export function trackLabContactClick(context: LabChallengeContext): void {
  trackLabEvent("lab_contact_click", labEventParams(context));
}
