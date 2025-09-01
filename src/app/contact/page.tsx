// src/app/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setNote(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      course: String(form.get("course") || ""),
      message: String(form.get("message") || ""),
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setStatus("success");
        setNote("Enquiry submitted successfully. We’ll contact you shortly.");
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setNote(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setNote("Network error. Please check your connection and try again.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Contact / Enquiry</h1>
        <p className="text-gray-600">
          Have a question about our courses? Send us a message and we’ll get back to you.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" required className="w-full border rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full border rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required className="w-full border rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="course">Course</label>
          <select id="course" name="course" required className="w-full border rounded-md p-2">
            <option value="">Select a course</option>
            <option value="full-stack">Full-Stack (MERN + Gen AI)</option>
            <option value="data-science">Data Science & AI</option>
            <option value="python">Python Programming</option>
            <option value="java">Java Programming</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} className="w-full border rounded-md p-2" />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md px-4 py-2 bg-blue-600 text-white disabled:opacity-60"
        >
          {status === "loading" ? "Submitting..." : "Submit Enquiry"}
        </button>

        {note && (
          <p className={`text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>{note}</p>
        )}
      </form>
    </main>
  );
}
