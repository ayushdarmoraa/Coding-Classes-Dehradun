import { z } from "zod";
import {
  getPublishableTestimonials,
  testimonials,
  type Testimonial,
} from "./testimonials";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    if (![year, month, day].every(Number.isInteger)) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Expected a real calendar date");

// References and boolean flags are recorded workflow attestations. This validates their
// structure and presence, but cannot independently authenticate a source or human approval.
const evidenceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sourceEvidenceReference: z.string().trim().min(1),
  sourceVerified: z.boolean(),
  claimVerified: z.boolean(),
  verificationOwner: z.string().trim().min(1),
  verifiedAt: dateSchema,
  businessApprovalReference: z.string().trim().min(1),
  businessApproved: z.boolean(),
  published: z.boolean(),
});

const outcomeMetricSchema = evidenceSchema
  .extend({
    kind: z.enum(["completion", "placement", "project-completion"]),
    title: z.string().trim().min(1),
    publicStatement: z.string().trim().min(1),
    sourceLabel: z.string().trim().min(1),
    definition: z.string().trim().min(1),
    placementDefinition: z.string().trim().min(1).optional(),
    numerator: z.number().int().nonnegative(),
    denominator: z.number().int().positive(),
    eligibleCohort: z.string().trim().min(1),
    periodStart: dateSchema,
    periodEnd: dateSchema,
    sampleSize: z.number().int().positive(),
    exclusions: z.array(z.string().trim().min(1)).min(1),
    limitations: z.string().trim().min(1),
    consentEvidenceReference: z.string().trim().min(1).optional(),
    consentVerified: z.boolean().optional(),
    consentScope: z.array(z.enum(["aggregate", "project", "profile", "image"])).optional(),
  })
  .refine((metric) => metric.numerator <= metric.denominator, {
    message: "Numerator cannot exceed denominator",
    path: ["numerator"],
  })
  .refine((metric) => metric.periodStart <= metric.periodEnd, {
    message: "Measurement period end must not precede its start",
    path: ["periodEnd"],
  })
  .refine(
    (metric) =>
      !metric.published ||
      metric.kind !== "placement" ||
      Boolean(metric.placementDefinition),
    {
      message: "Placement metrics must define what counts as placed",
      path: ["placementDefinition"],
    },
  )
  .refine(
    (metric) =>
      !metric.published ||
      metric.kind !== "project-completion" ||
      (Boolean(metric.consentEvidenceReference) &&
        metric.consentVerified === true &&
        (metric.consentScope?.includes("project") === true ||
          metric.consentScope?.includes("aggregate") === true)),
    {
      message: "Project completion metrics require verified publication permission",
      path: ["consentEvidenceReference"],
    },
  );

export type OutcomeMetric = z.infer<typeof outcomeMetricSchema>;
export interface OutcomeStory {
  slug: string;
  attribution: string;
  quote: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface PublishedOutcomeContent {
  metrics: OutcomeMetric[];
  stories: OutcomeStory[];
}

export const OUTCOME_METRICS: readonly OutcomeMetric[] = [];

export function validateOutcomeEvidence(
  metrics: readonly unknown[],
): OutcomeMetric[] {
  const parsedMetrics = z.array(outcomeMetricSchema).parse(metrics);
  const slugs = parsedMetrics.map(({ slug }) => slug);

  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Outcome evidence slugs must be unique");
  }

  return parsedMetrics;
}

export function getPublishedOutcomeContent(
  metrics: readonly unknown[] = OUTCOME_METRICS,
  testimonialRecords: readonly Testimonial[] = testimonials,
): PublishedOutcomeContent {
  const validatedMetrics = validateOutcomeEvidence(metrics);
  return {
    metrics: validatedMetrics.filter(
      (metric) =>
        metric.published &&
        metric.sourceVerified &&
        metric.claimVerified &&
        metric.businessApproved &&
        (metric.kind !== "project-completion" ||
          (metric.consentVerified === true &&
            (metric.consentScope?.includes("project") === true ||
              metric.consentScope?.includes("aggregate") === true))),
    ),
    stories: getPublishableTestimonials(testimonialRecords).flatMap(
      (testimonial, index) => {
        const sourceLabel = testimonial.source?.trim();
        if (
          !sourceLabel ||
          (testimonial.sourceUrl && !isSafeSourceUrl(testimonial.sourceUrl))
        ) {
          return [];
        }

        return [
          {
            slug: `testimonial-${index + 1}`,
            attribution: testimonial.author,
            quote: testimonial.text,
            sourceLabel,
            ...(testimonial.sourceUrl ? { sourceUrl: testimonial.sourceUrl } : {}),
          },
        ];
      },
    ),
  };
}

function isSafeSourceUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function hasPublishedOutcomeContent(): boolean {
  const { metrics, stories } = getPublishedOutcomeContent();
  return metrics.length > 0 || stories.length > 0;
}

export function buildOutcomeItemListSchema(content: PublishedOutcomeContent) {
  const items = [
    ...content.metrics.map(({ title, publicStatement }) => ({
      name: title,
      description: publicStatement,
    })),
    ...content.stories.map(({ attribution, quote }) => ({
      name: attribution,
      description: quote,
    })),
  ];

  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: item.name,
        description: item.description,
      },
    })),
  };
}
