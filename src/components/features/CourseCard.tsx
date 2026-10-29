import React from "react";
import type { Course } from "@/lib/courses";
import { formatCourseDuration, formatCourseModes, formatCoursePrice, formatINR } from "@/lib/pricing";
import { getCourseExperienceContent } from "@/lib/course-experience-content";
import { SITE } from "@/lib/site-config";
import Button from "@/components/ui/Button";
import CourseCardFlip from "@/components/features/CourseCardFlip";

interface CourseCardProps {
  course: Course;
  featured?: boolean;
  relatedChallengeHref?: string;
  analyticsLocation?: string;
  showProjectSummary?: boolean;
}

const COURSE_GLYPHS: Record<string, string> = {
  "full-stack": "</>",
  "data-science": "DS",
  python: "PY",
  java: "JV",
};

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  featured = false,
  relatedChallengeHref,
  analyticsLocation,
  showProjectSummary = false,
}) => {
  const iconGlyph = (course.slug ? COURSE_GLYPHS[course.slug] : undefined) ?? "</>";
  const courseContent = getCourseExperienceContent(course);

  return (
    <CourseCardFlip>
      <div className={`cf ${featured ? "ring-2 ring-brand/40" : ""}`} data-accent={course.slug}>
        <div className="cf-inner">
          <div className="cf-face cf-front">
            <div className="cf-top">
              <span className="cf-icon" aria-hidden="true">{iconGlyph}</span>
              <span className="cf-badge">{formatCourseDuration(course.duration)}</span>
            </div>
            <h3 className="cf-title">{course.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-2">{course.description}</p>
            <p className="mt-2 text-xs leading-5 text-ink-2">
              Explore the listed curriculum to see what the course covers.
            </p>
            {course.level && <span className="cf-badge">{course.level}</span>}
            <div className="cf-stats">
              <div>{formatCourseDuration(course.duration)}</div>
              <div>{formatINR(course.pricing.packageRate)} pkg</div>
              <div>
                {course.pricing.monthlyRate !== undefined
                  ? `${formatINR(course.pricing.monthlyRate)}/mo`
                  : formatCourseModes(course)}
              </div>
            </div>
          </div>

          <div className="cf-face cf-back">
            <div className="cf-dots" aria-hidden="true"><i /><i /><i /></div>
            <p className="cf-price">
              Fees: {formatCoursePrice(course.pricing)}
            </p>
            <p className="cf-delivery">
              Delivery: {formatCourseModes(course)}
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">Topics covered</p>
            <ul className="cf-lines">
              {course.curriculum.slice(0, 3).map((item, index) => (
                <li key={index} className="cf-line">
                  {item}
                </li>
              ))}
            </ul>
            {showProjectSummary && (
              <p className="mt-3 text-sm leading-5 text-ink-2">
                <span className="font-semibold text-ink">Practical work:</span>{" "}
                {courseContent.projectSummary}
              </p>
            )}
            <div className="cf-actions">
              <Button
                variant="ghost"
                href={`/courses/${course.slug}`}
                event={analyticsLocation ? "cta_home_course_details" : undefined}
                eventParams={analyticsLocation ? { location: analyticsLocation, course_slug: course.slug } : undefined}
                className="cf-btn"
              >
                View Details
              </Button>
              {relatedChallengeHref && (
                <Button
                  variant="ghost"
                  href={relatedChallengeHref}
                  event="cta_related_challenge"
                  eventParams={{ course_slug: course.slug }}
                  className="cf-btn cf-btn-ghost"
                >
                  Try Related Challenge
                </Button>
              )}
              <a
                href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hi, I'm interested in the ${course.title} course`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cf-btn cf-btn-ghost"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </CourseCardFlip>
  );
};

export default CourseCard;
