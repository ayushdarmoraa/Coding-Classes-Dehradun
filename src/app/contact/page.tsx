// src/app/contact/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", phone: "", course: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
      valid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) { // Basic phone number validation (10-15 digits, optional +)
      newErrors.phone = "Invalid phone number format (10-15 digits).";
      valid = false;
    }

    if (!formData.course) {
      newErrors.course = "Please select a course.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    // Validate form whenever formData changes, but only if user has interacted with fields
    if (status !== "idle") { // Only validate after first submission attempt or if user is actively typing
      validateForm();
    }
  }, [formData, status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setNote(null);

    if (!validateForm()) {
      setStatus("idle"); // Stay idle if validation fails
      setNote("Please correct the errors in the form.");
      return;
    }

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setStatus("success");
        setNote("Enquiry submitted successfully. We’ll contact you shortly.");
        setFormData({ name: "", email: "", phone: "", course: "", message: "" }); // Clear form fields
      } else {
        setStatus("error");
        setNote(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setNote("Network error. Please check your connection and try again.");
    }
  }

  const isFormValid = Object.values(errors).every(error => error === "") && 
                      Object.values(formData).every(value => value.trim() !== "" || value === formData.message); // Message is optional

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
          <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded-md p-2" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full border rounded-md p-2" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border rounded-md p-2" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="course">Course</label>
          <select id="course" name="course" value={formData.course} onChange={handleChange} required className="w-full border rounded-md p-2">
            <option value="">Select a course</option>
            <option value="full-stack">Full-Stack (MERN + Gen AI)</option>
            <option value="data-science">Data Science & AI</option>
            <option value="python">Python Programming</option>
            <option value="java">Java Programming</option>
          </select>
          {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} className="w-full border rounded-md p-2" />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !isFormValid}
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


