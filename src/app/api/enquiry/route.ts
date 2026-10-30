// src/app/api/enquiry/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  enquiryHoneypotSchema,
  enquirySchema,
} from "@/lib/enquiry-schema";

// Process-scoped only: resets on restart/deploy and is not distributed protection.
type Bucket = { count: number; first: number };
const RATE_BUCKETS = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQ = 5; // 5 requests per window per IP

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  // Not always available; fallback
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const b = RATE_BUCKETS.get(ip);
  if (!b) {
    RATE_BUCKETS.set(ip, { count: 1, first: now });
    return false;
  }
  // reset window
  if (now - b.first > WINDOW_MS) {
    RATE_BUCKETS.set(ip, { count: 1, first: now });
    return false;
  }
  b.count += 1;
  RATE_BUCKETS.set(ip, b);
  return b.count > MAX_REQ;
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

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const ip = getClientIp(req);

    // Honeypot check (treat as success to avoid tipping off bots)
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const website = (body as Record<string, unknown>).website;
      const parsedHoneypot = enquiryHoneypotSchema.safeParse(website);
      if (parsedHoneypot.success && parsedHoneypot.data.trim().length > 0) {
        return NextResponse.json({ success: true });
      }
    }

    // Rate limiting
    if (rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try later." },
        { status: 429 }
      );
    }

    // Field validation
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: typeof issue.path[0] === "string" ? issue.path[0] : "form",
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 }
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

    // Configure Nodemailer SMTP
    const transportOptions: SMTPTransport.Options = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
    const transporter = nodemailer.createTransport(transportOptions);

    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Doon Coding Academy"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com",
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
      { status: 500 }
    );
  }
}
