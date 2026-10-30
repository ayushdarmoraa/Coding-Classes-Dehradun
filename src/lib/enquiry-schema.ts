import { z } from "zod";

const COURSE_VALUES = [
  "full-stack",
  "data-science",
  "python",
  "java",
  "other",
] as const;

const leadContextFields = {
  source: z.literal("lab").optional(),
  challenge: z.literal("discount-calculation-bug").optional(),
  track: z.literal("javascript").optional(),
  relatedCourse: z.literal("full-stack").optional(),
};

function validateLeadContext(
  context: z.infer<z.ZodObject<typeof leadContextFields>>,
  issues: z.RefinementCtx,
) {
  const hasContext = Boolean(
    context.challenge || context.track || context.relatedCourse,
  );

  if (hasContext && context.source !== "lab") {
    issues.addIssue({
      code: "custom",
      message: "Lead context requires a valid source",
      path: ["source"],
    });
  }

  if (context.source === "lab") {
    for (const field of ["challenge", "track", "relatedCourse"] as const) {
      if (!context[field]) {
        issues.addIssue({
          code: "custom",
          message: "Complete Lab context is required",
          path: [field],
        });
      }
    }
  }
}

export const enquiryLeadContextSchema = z
  .object(leadContextFields)
  .strict()
  .superRefine(validateLeadContext);

export const enquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be 100 characters or fewer")
      .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), {
        message: "Name cannot contain control characters",
      }),
    email: z
      .string()
      .trim()
      .max(254, "Email must be 254 characters or fewer")
      .email("Invalid email format"),
    phone: z
      .string()
      .trim()
      .max(30, "Phone must be 30 characters or fewer")
      .refine(
        (value) =>
          value === "" ||
          (!/[\r\n]/.test(value) && /^\+?[\d\s\-()]{10,}$/.test(value)),
        { message: "Invalid phone format" },
      )
      .optional()
      .default(""),
    course: z
      .union([z.literal(""), z.enum(COURSE_VALUES)])
      .optional()
      .default(""),
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(2000, "Message must be 2000 characters or fewer"),
    website: z.string().max(100).optional().default(""),
    ...leadContextFields,
  })
  .strict()
  .superRefine(validateLeadContext);

export type EnquiryPayload = z.infer<typeof enquirySchema>;
export type EnquiryLeadContext = z.infer<typeof enquiryLeadContextSchema>;

export const enquiryHoneypotSchema = z.string().max(100);
