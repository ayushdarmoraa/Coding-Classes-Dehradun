import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  enquiryHoneypotSchema,
  enquirySchema,
} from "@/lib/enquiry-schema";

type Bucket = { count: number; first: number };
type EnquiryEnvironment = Record<string, string | undefined>;

const RATE_BUCKETS = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 5;

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(ip);
  if (!bucket) {
    RATE_BUCKETS.set(ip, { count: 1, first: now });
    return false;
  }
  if (now - bucket.first > WINDOW_MS) {
    RATE_BUCKETS.set(ip, { count: 1, first: now });
    return false;
  }
  bucket.count += 1;
  RATE_BUCKETS.set(ip, bucket);
  return bucket.count > MAX_REQ;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getSafeErrorDetails(error: unknown): {
  name: string;
  code?: string;
} {
  if (!error || typeof error !== "object") return { name: "UnknownError" };

  const errorName =
    "name" in error && typeof error.name === "string"
      ? error.name.slice(0, 80)
      : "UnknownError";
  const errorCode =
    "code" in error && typeof error.code === "string"
      ? error.code.slice(0, 80)
      : undefined;

  return { name: errorName, ...(errorCode ? { code: errorCode } : {}) };
}

function getSmtpConfiguration(env: EnquiryEnvironment): {
  transportOptions: SMTPTransport.Options;
  fromName: string;
  fromAddress: string;
  recipient: string;
} | null {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  const configuredPort = env.SMTP_PORT?.trim();
  const port = configuredPort ? Number(configuredPort) : 587;

  if (
    !host ||
    !user ||
    !pass ||
    !pass.trim() ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    return null;
  }

  return {
    transportOptions: {
      host,
      port,
      secure: env.SMTP_SECURE === "true",
      auth: { user, pass },
    },
    fromName: env.SMTP_FROM_NAME?.trim() || "Doon Coding Academy",
    fromAddress: env.SMTP_FROM_EMAIL?.trim() || user,
    recipient: env.CONTACT_EMAIL?.trim() || "dooncodingacademy@gmail.com",
  };
}

export function createEnquiryHandler(
  env: EnquiryEnvironment,
  createTransport: typeof nodemailer.createTransport = nodemailer.createTransport,
) {
  return async function handleEnquiry(req: Request) {
    try {
      const body: unknown = await req.json();
      const ip = getClientIp(req);

      if (body && typeof body === "object" && !Array.isArray(body)) {
        const website = (body as Record<string, unknown>).website;
        const parsedHoneypot = enquiryHoneypotSchema.safeParse(website);
        if (parsedHoneypot.success && parsedHoneypot.data.trim().length > 0) {
          return NextResponse.json({ success: true });
        }
      }

      if (rateLimit(ip)) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Please try later." },
          { status: 429 },
        );
      }

      const parsed = enquirySchema.safeParse(body);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => ({
          field: typeof issue.path[0] === "string" ? issue.path[0] : "form",
          message: issue.message,
        }));
        return NextResponse.json(
          { success: false, error: "Validation failed", errors },
          { status: 400 },
        );
      }

      const smtp = getSmtpConfiguration(env);
      if (!smtp) {
        return NextResponse.json(
          {
            success: false,
            error: "Enquiry service is temporarily unavailable. Please try again later.",
          },
          { status: 503 },
        );
      }

      const {
        name,
        email,
        phone,
        course,
        message,
        source,
        challenge,
        track,
        relatedCourse,
      } = parsed.data;
      const contextLines =
        source === "lab"
          ? [
              "Origin: DCA Lab",
              `Challenge: ${challenge}`,
              `Track: ${track}`,
              `Related course: ${relatedCourse}`,
            ]
          : [];

      const transporter = createTransport(smtp.transportOptions);
      await transporter.sendMail({
        from: { name: smtp.fromName, address: smtp.fromAddress },
        to: smtp.recipient,
        subject: "New website enquiry",
        text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Course: ${course || "N/A"}
User message (untrusted, JSON-encoded): ${JSON.stringify(message)}

Verified lead context:
${contextLines.length ? contextLines.join("\n") : "None"}
      `,
        html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
        <p><strong>Course:</strong> ${escapeHtml(course || "N/A")}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\r?\n/g, "<br/>")}</p>
        ${contextLines.length ? `<p>${contextLines.map(escapeHtml).join("<br/>")}</p>` : ""}
      `,
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      console.error("Enquiry delivery failed", getSafeErrorDetails(error));
      return NextResponse.json(
        {
          success: false,
          error: "Unable to send enquiry. Please try again.",
        },
        { status: 500 },
      );
    }
  };
}
