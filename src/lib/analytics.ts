// Generic GA parameter map (avoid 'any')
// Using unknown allows safe passing through to gtag / dataLayer without typing noise.
import { PUBLISHED_LAB_ANALYTICS_METADATA } from "./lab/analytics-metadata";

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

/** Accepts only a pathname; query strings and fragments are rejected. */
export function derivePageContext(pathname: string): {
  page_type: string;
  course_slug: string;
  city: "dehradun" | "india" | "(unknown)";
} {
  if (typeof pathname !== "string" || /[?#]/.test(pathname)) {
    return { page_type: "generic", course_slug: "", city: "(unknown)" };
  }

  const path = pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const labPath = pathname.replace(/\/+$/, "") || "/";
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
  } else if (labPath === "/lab") {
    page_type = "lab_index";
  } else if (PUBLISHED_LAB_ANALYTICS_METADATA.some(
    ({ track, slug, status }) =>
      status === "published" && labPath === `/lab/${track}/${slug}`,
  )) {
    page_type = "lab_challenge";
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

const FORM_ANALYTICS_FIELD_NAMES = new Set([
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
const FORM_ANALYTICS_PAGE_TYPES = new Set([
  "generic",
  "contact",
  "course_detail",
  "online_course_detail",
  "comparison",
  "blog_post",
  "lab_index",
  "lab_challenge",
]);
const FORM_ANALYTICS_COURSE_SLUGS = new Set([
  "(none)",
  "full-stack",
  "data-science",
  "python",
  "java",
]);

function safeFormAnalyticsParams(extra: GAParams): GAParams {
  const safe: GAParams = {};

  if (
    typeof extra.page_type === "string" &&
    FORM_ANALYTICS_PAGE_TYPES.has(extra.page_type)
  ) {
    safe.page_type = extra.page_type;
  }
  if (
    typeof extra.course_slug === "string" &&
    FORM_ANALYTICS_COURSE_SLUGS.has(extra.course_slug)
  ) {
    safe.course_slug = extra.course_slug;
  }
  if (
    extra.city === "dehradun" ||
    extra.city === "india" ||
    extra.city === "(unknown)"
  ) {
    safe.city = extra.city;
  }
  if (
    typeof extra.page_path === "string" &&
    extra.page_path.length <= 200 &&
    /^\/[a-zA-Z0-9/_-]*$/.test(extra.page_path)
  ) {
    safe.page_path = extra.page_path;
  }
  if (extra.error_origin === "validation" || extra.error_origin === "server") {
    safe.error_origin = extra.error_origin;
  }
  if (Array.isArray(extra.field_errors)) {
    const fieldErrors = extra.field_errors.filter(
      (field): field is string =>
        typeof field === "string" && FORM_ANALYTICS_FIELD_NAMES.has(field),
    );
    if (fieldErrors.length > 0) safe.field_errors = fieldErrors;
  }
  if (typeof extra.has_message === "boolean") {
    safe.has_message = extra.has_message;
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

const SAFE_ROUTE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ATTEMPT_NUMBER = 10000;
const MAX_HINT_LEVEL = 5;

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
