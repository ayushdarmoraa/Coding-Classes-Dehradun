import {
  trackLabComplete,
  trackLabCompletion,
  trackLabContactClick,
  trackLabCourseClick,
  trackLabFirstEdit,
  trackLabHintOpen,
  trackLabImpression,
  trackLabReset,
  trackLabRun,
  trackLabSkillMapView,
  trackLabStart,
  trackLabTestResult,
  type LabChallengeContext,
} from "@/lib/analytics";

export type LabLinkAction =
  | { event: "start"; context: LabChallengeContext }
  | {
      event: "course";
      context: LabChallengeContext;
      relatedCourseSlug: string;
    }
  | { event: "contact"; context: LabChallengeContext };

export function recordLabLinkClick(action: LabLinkAction): void {
  if (action.event === "start") {
    trackLabStart(action.context);
  } else if (action.event === "course") {
    trackLabCourseClick(action.context, action.relatedCourseSlug);
  } else {
    trackLabContactClick(action.context);
  }
}

export function createLabIndexImpressionTracker(
  context: LabChallengeContext,
): (pathname: string | null) => void {
  let lastPageView: string | null = null;
  return (pathname) => {
    const normalizedPathname = pathname?.replace(/\/+$/, "") || pathname;
    if (normalizedPathname !== "/lab") {
      lastPageView = null;
      return;
    }

    const pageView = `${normalizedPathname}:${context.challengeSlug}`;
    if (lastPageView === pageView) return;
    lastPageView = pageView;
    // The Lab index impression represents its featured published mission.
    trackLabImpression(context);
  };
}

export class LabAnalyticsSession {
  private impressionTracked = false;
  private firstEditTracked = false;
  private completionTracked = false;
  private skillMapTracked = false;
  private nextRunToken = 0;
  private activeRun: { token: number; attemptNumber: number } | null = null;

  constructor(private readonly context: LabChallengeContext) {}

  pageImpression(): void {
    if (this.impressionTracked) return;
    this.impressionTracked = true;
    trackLabImpression(this.context);
  }

  firstEdit(): void {
    if (this.firstEditTracked) return;
    this.firstEditTracked = true;
    trackLabFirstEdit(this.context);
  }

  run(attemptNumber: number): number {
    const token = ++this.nextRunToken;
    this.activeRun = { token, attemptNumber };
    trackLabRun(this.context, attemptNumber);
    return token;
  }

  testResult(runToken: number, completed: boolean): void {
    if (this.activeRun?.token !== runToken) return;
    const { attemptNumber } = this.activeRun;
    this.activeRun = null;
    trackLabTestResult(this.context, attemptNumber, completed);
  }

  cancelRun(runToken: number): void {
    // Cancellation has no verified passing outcome, so report it as incomplete.
    this.testResult(runToken, false);
  }

  reset(): void {
    this.activeRun = null;
    this.completionTracked = false;
    trackLabReset(this.context);
  }

  hintOpen(hintLevel: number): void {
    trackLabHintOpen(this.context, hintLevel);
  }

  complete(attemptNumber: number): void {
    if (this.completionTracked) return;
    this.completionTracked = true;
    trackLabComplete(this.context, attemptNumber);
    trackLabCompletion(this.context.challengeSlug);
  }

  skillMapViewed(): void {
    if (this.skillMapTracked) return;
    this.skillMapTracked = true;
    trackLabSkillMapView(this.context);
  }
}

export function observeLabSkillMap(
  element: Element,
  onViewed: () => void,
): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};

  let viewed = false;
  const observer = new IntersectionObserver(
    (entries) => {
      if (
        !viewed &&
        entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25,
        )
      ) {
        viewed = true;
        observer.disconnect();
        onViewed();
      }
    },
    { threshold: 0.25 },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
