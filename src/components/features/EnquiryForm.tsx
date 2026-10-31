"use client";
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { derivePageContext, trackLeadClick, trackForm } from '@/lib/analytics';
import {
  enquirySchema,
  type EnquiryLeadContext,
} from '@/lib/enquiry-schema';

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

type EnquiryStatusProps = {
  message: string;
  statusRef: React.MutableRefObject<HTMLDivElement | null>;
};

export function EnquirySuccessNotice({
  message,
  statusRef,
}: EnquiryStatusProps) {
  return (
    <div
      ref={statusRef}
      tabIndex={-1}
      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="text-green-500 text-xl mr-3" aria-hidden="true">
          ✓
        </span>
        <p className="text-green-800">{message}</p>
      </div>
    </div>
  );
}

export function EnquiryErrorNotice({
  message,
  statusRef,
}: EnquiryStatusProps) {
  return (
    <div
      ref={statusRef}
      tabIndex={-1}
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center">
        <span className="text-red-500 text-xl mr-3" aria-hidden="true">
          ⚠
        </span>
        <p className="text-red-800">{message}</p>
      </div>
    </div>
  );
}

const courseOptions = [
  { value: 'full-stack', label: 'Full-Stack Development (MERN + Gen AI)' },
  { value: 'data-science', label: 'Data Science & AI' },
  { value: 'python', label: 'Python Programming' },
  { value: 'java', label: 'Java Programming' },
  { value: 'other', label: 'Other / General Inquiry' }
];

const fieldNames = new Set([
  'name',
  'email',
  'phone',
  'course',
  'message',
  'website',
  'source',
  'challenge',
  'track',
  'relatedCourse',
]);

export function createWhatsAppEnquiryUrl(
  formData: Pick<FormData, 'name' | 'email' | 'phone' | 'course' | 'message'>,
) {
  const selectedCourse =
    courseOptions.find((option) => option.value === formData.course)?.label ||
    'Not selected';
  const message = [
    'Hi, I would like to enquire about a course at Doon Coding Academy.',
    '',
    `Full Name: ${formData.name.trim()}`,
    `Email Address: ${formData.email.trim()}`,
    `Phone Number: ${formData.phone.trim() || 'Not provided'}`,
    `Course of Interest: ${selectedCourse}`,
    '',
    'Message:',
    formData.message.trim(),
  ].join('\n');

  return `https://wa.me/917037905464?text=${encodeURIComponent(message)}`;
}

export function resolveWhatsAppFormData(
  formData: FormData,
  submittedFormData: FormData | null,
  submitStatus: 'idle' | 'success' | 'error',
) {
  return submitStatus === 'success' && submittedFormData
    ? submittedFormData
    : formData;
}

const EnquiryForm: React.FC<{ leadContext?: EnquiryLeadContext }> = ({
  leadContext,
}) => {
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
  const [submittedFormData, setSubmittedFormData] = useState<FormData | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const focusFirstErrorRef = useRef(false);
  const submissionInFlightRef = useRef(false);

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
    setSubmitStatus('idle');
    emitStartOnce();
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const parsed = enquirySchema.safeParse({ ...formData, ...leadContext });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === 'string' &&
          fieldNames.has(field) &&
          !newErrors[field]
        ) {
          newErrors[field] = issue.message;
        }
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleWhatsAppClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    emitStartOnce();
    if (submitStatus === 'success' && submittedFormData) {
      trackLeadClick('whatsapp', {
        page_type: ctx.page_type,
        course_slug: ctx.course_slug || '(none)',
        city: ctx.city,
        page_path: pathname,
      });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      event.preventDefault();
      focusFirstErrorRef.current = true;
      trackForm('error', {
        page_type: ctx.page_type,
        course_slug: ctx.course_slug || '(none)',
        city: ctx.city,
        page_path: pathname,
        error_origin: 'validation',
        field_errors: Object.keys(validationErrors),
        has_message: Boolean(formData.message.trim()),
      });
      return;
    }

    trackLeadClick('whatsapp', {
      page_type: ctx.page_type,
      course_slug: ctx.course_slug || '(none)',
      city: ctx.city,
      page_path: pathname,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submissionInFlightRef.current) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      focusFirstErrorRef.current = true;
      // Validation error event
      trackForm('error', {
        page_type: ctx.page_type,
        course_slug: ctx.course_slug || '(none)',
        city: ctx.city,
        page_path: pathname,
        error_origin: 'validation',
        field_errors: Object.keys(validationErrors),
        has_message: Boolean(formData.message.trim()),
      });
      return;
    }
    
    submissionInFlightRef.current = true;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
  const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, ...leadContext }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmittedFormData({ ...formData });
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
          message: '',
          website: '',
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
      submissionInFlightRef.current = false;
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

  useEffect(() => {
    if (!focusFirstErrorRef.current) return;
    focusFirstErrorRef.current = false;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

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
        <EnquirySuccessNotice message={submitMessage} statusRef={statusRef} />
      )}

      {submitStatus === 'error' && (
        <EnquiryErrorNotice message={submitMessage} statusRef={statusRef} />
      )}

      <form
        ref={formRef}
        aria-busy={isSubmitting}
        noValidate
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
            maxLength={100}
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
            maxLength={254}
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
            maxLength={30}
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
          maxLength={2000}
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
            href={createWhatsAppEnquiryUrl(
              resolveWhatsAppFormData(
                formData,
                submittedFormData,
                submitStatus,
              ),
            )}
            className="flex-1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
          >
            WhatsApp Us
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EnquiryForm;
