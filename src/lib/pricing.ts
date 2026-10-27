import type { Course, CourseDuration, CoursePricing } from "./courses";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCoursePrice(pricing: CoursePricing): string {
  const packageRate = `${formatINR(pricing.packageRate)} package rate`;
  return pricing.monthlyRate === undefined
    ? packageRate
    : `${packageRate}; ${formatINR(pricing.monthlyRate)}/month option`;
}

export function formatCourseDuration(duration: CourseDuration): string {
  return `${duration.value} ${duration.unit}`;
}

export function formatCourseModes(course: Pick<Course, "modes" | "modeStatus">): string {
  return course.modeStatus === "confirmed"
    ? course.modes.join(" / ")
    : "Delivery availability not confirmed";
}

export function courseDurationToIso(duration: CourseDuration): string {
  return duration.unit === "months"
    ? `P${duration.value}M`
    : `P${duration.value}D`;
}
