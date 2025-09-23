// src/app/api/enquiry/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "fs";
import path from "path";

type EnquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  course?: string;
  message: string;
  website?: string; // honeypot
};

// Simple in-memory IP rate limiter (process scoped; resets on deploy)
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

function validate(payload: Partial<EnquiryPayload>) {
  const errors: { field: keyof EnquiryPayload; message: string }[] = [];
  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const phone = (payload.phone || "").trim();
  const course = (payload.course || "").trim();
  const message = (payload.message || "").trim();

  if (!name) errors.push({ field: "name", message: "Name is required" });
  else if (name.length < 2) errors.push({ field: "name", message: "Name must be at least 2 characters" });

  if (!email) errors.push({ field: "email", message: "Email is required" });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: "email", message: "Invalid email format" });

  if (phone && !/^\+?[\d\s-()]{10,}$/.test(phone)) errors.push({ field: "phone", message: "Invalid phone format" });

  // course is optional; if provided, validate known options
  if (course && !["full-stack", "data-science", "python", "java", "other"].includes(course)) {
    errors.push({ field: "course", message: "Invalid course selection" });
  }

  if (!message) errors.push({ field: "message", message: "Message is required" });

  return { valid: errors.length === 0, errors };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<EnquiryPayload>;
    const ip = getClientIp(req);

    // Honeypot check (treat as success to avoid tipping off bots)
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    // Rate limiting
    if (rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try later." },
        { status: 429 }
      );
    }

    // Field validation
    const { valid, errors } = validate(body);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, phone, course, message } = body as EnquiryPayload;

    // Write enquiry to local JSON (backup)
    const dataFile = path.join(process.cwd(), "data", "enquiries.json");
    type StoredEnquiry = {
      name: string;
      email: string;
      phone?: string;
      course?: string;
      message: string;
      createdAt: string;
    };
    const existing: StoredEnquiry[] = fs.existsSync(dataFile)
      ? (JSON.parse(fs.readFileSync(dataFile, "utf8")) as StoredEnquiry[])
      : [];
    existing.push({
      name,
      email,
      phone,
      course,
      message,
      createdAt: new Date().toISOString(),
    });
    // Ensure directory exists before writing
    const dataDir = path.dirname(dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(existing, null, 2));

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
      subject: `New Enquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Course: ${course || "N/A"}
Message: ${message}
      `,
      html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Course:</strong> ${course || "N/A"}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Enquiry error:", err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

