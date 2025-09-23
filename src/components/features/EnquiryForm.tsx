"use client";
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { derivePageContext, trackLeadClick, trackForm } from '@/lib/analytics';

interface FormData {
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  website?: string; // honeypot
}

interface FormErrors {
  [key: string]: string;
}

const courseOptions = [
  { value: 'full-stack', label: 'Full-Stack Development (MERN + Gen AI)' },
  { value: 'data-science', label: 'Data Science & AI' },
  { value: 'python', label: 'Python Programming' },
  { value: 'java', label: 'Java Programming' },
  { value: 'other', label: 'Other / General Inquiry' }
];

const EnquiryForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
    website: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const statusRef = useRef<HTMLDivElement | null>(null);

  // --- Analytics context ---
  const startedRef = useRef(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const ctx = useMemo(() => derivePageContext(pathname), [pathname]);

  const emitStartOnce = () => {
    if (startedRef.current) return;
    startedRef.current = true;
  trackForm('start', {
      page_type: ctx.page_type,
      course_slug: ctx.course_slug || '(none)',
      city: ctx.city,
      page_path: pathname,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    emitStartOnce();
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    // Phone is optional; if provided, validate format
    if (formData.phone.trim() && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    // Course is optional for API; keep free-form/select but no required error
    // Message is required to align with API
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Validation error event
  trackForm('error', {
        page_type: ctx.page_type,
        course_slug: ctx.course_slug || '(none)',
        city: ctx.city,
        page_path: pathname,
        error_origin: 'validation',
        field_errors: Object.keys(errors).length ? Object.keys(errors) : undefined,
        has_message: Boolean(formData.message.trim()),
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
  const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you! We’ve received your enquiry and will get back shortly.');
  trackForm('submit', {
          page_type: ctx.page_type,
          course_slug: ctx.course_slug || '(none)',
          city: ctx.city,
            page_path: pathname,
          has_message: Boolean(formData.message.trim()),
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          course: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || result.message || 'Something went wrong. Please try again.');
        const serverFieldErrors: string[] = Array.isArray(result.errors)
          ? result.errors.map((er: { field?: string }) => er.field).filter(Boolean)
          : [];
  trackForm('error', {
          page_type: ctx.page_type,
          course_slug: ctx.course_slug || '(none)',
          city: ctx.city,
          page_path: pathname,
          error_origin: 'server',
          field_errors: serverFieldErrors.length ? serverFieldErrors : undefined,
          has_message: Boolean(formData.message.trim()),
        });
        
        // Handle validation errors from server
        if (result.errors) {
          const serverErrors: FormErrors = {};
          result.errors.forEach((error: { field: string; message: string }) => {
            serverErrors[error.field] = error.message;
          });
          setErrors(serverErrors);
        }
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
  trackForm('error', {
        page_type: ctx.page_type,
        course_slug: ctx.course_slug || '(none)',
        city: ctx.city,
        page_path: pathname,
        error_origin: 'server',
        has_message: Boolean(formData.message.trim()),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move focus to status banner when it appears
  useEffect(() => {
    if (submitStatus !== 'idle' && statusRef.current) {
      try {
        statusRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        statusRef.current.focus();
      } catch {}
    }
  }, [submitStatus]);

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Get in Touch
        </h3>
        <p className="text-gray-600">
          Ready to start your coding journey? Fill out the form below and we&#39;ll get back to you within 24 hours.
        </p>
      </div>

      {submitStatus === 'success' && (
        <div ref={statusRef} tabIndex={-1} className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
          <div className="flex items-center mb-2">
            <span className="text-green-500 text-xl mr-3">✓</span>
            <p className="text-green-800">{submitMessage}</p>
          </div>
          {/* Google Review CTA */}
          <div className="mt-2">
            <a
              href="https://g.page/r/CQkQwQwQwQwQEAI/review" // Replace with actual GBP review link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
              aria-label="Leave a Google review for Doon Coding Academy (opens in a new tab)"
            >
              ⭐ Leave a Google Review
            </a>
            <span className="sr-only">Opens in a new tab</span>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div ref={statusRef} tabIndex={-1} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">⚠</span>
            <p className="text-red-800">{submitMessage}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          emitStartOnce();
          handleSubmit(e);
        }}
        onFocus={emitStartOnce}
        onChange={emitStartOnce}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            id="name"
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Enter your full name"
          />
          
          <Input
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="your.email@example.com"
            aria-describedby="email-help"
          />
          {/* Helper text for email */}
          {/* This helper is visually subtle but screen-readable */}
          <p id="email-help" className="sr-only">We’ll only use your email to respond to your enquiry.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            id="phone"
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+91 9876543210"
          />
          
          <Select
            id="course"
            label="Course of Interest"
            name="course"
            value={formData.course}
            onChange={handleChange}
            error={errors.course}
            options={courseOptions}
            placeholder="Select a course"
          />
        </div>

        <Textarea
          id="message"
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your background, goals, or any questions you have..."
          rows={4}
          required
          error={errors.message}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Honeypot field: hidden from users, caught by bots */}
          <input
            type="text"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            aria-hidden="true"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            aria-label="Submit enquiry form"
            className="flex-1"
          >
            {isSubmitting ? 'Sending...' : 'Send Enquiry'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            size="lg"
            href="https://wa.me/917037905464?text=Hi, I'm interested in your coding courses"
            className="flex-1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLeadClick('whatsapp', { page_type: ctx.page_type, course_slug: ctx.course_slug || '(none)', city: ctx.city, page_path: pathname })}
          >
            WhatsApp Us
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EnquiryForm;

