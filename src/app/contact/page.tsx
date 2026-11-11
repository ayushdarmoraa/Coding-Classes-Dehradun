import type { Metadata } from "next";
import EnquiryForm from "@/components/features/EnquiryForm";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  enquiryLeadContextSchema,
  type EnquiryLeadContext,
} from "@/lib/enquiry-schema";
import { SITE } from "@/lib/site-config";

const BASE = SITE.url;

export const metadata: Metadata = {
  title: "Contact Us - Doon Coding Academy",
  description: "Get in touch with Doon Coding Academy. Contact us for course enquiries, admissions, and more information about our coding programs in Dehradun.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: BASE + "/contact",
  },
};

// NAP (Name-Address-Phone) from env for authoritative consistency
const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE || "+91 7037905464";
const PHONE_TEL = `tel:${(PHONE_DISPLAY || '').replace(/\s+/g, '')}`;
const EMAIL = process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com";
const STREET = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Ambala - Dehradun Rd, near D.R School, Herbertpur";
const LOCALITY = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
const REGION = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
const POSTAL = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";
const VISIBLE_LOCALITY = process.env.NEXT_PUBLIC_VISIBLE_LOCALITY || "Herbertpur (Dehradun district)";
const ADDRESS_DISPLAY = `${STREET}, ${VISIBLE_LOCALITY}, PIN ${POSTAL}`;
const MAP_Q = encodeURIComponent(`${STREET} ${LOCALITY} ${REGION} ${POSTAL}`);

const contactInfo = [
  {
    icon: "📞",
    title: "Phone & WhatsApp",
    details: PHONE_DISPLAY,
    action: PHONE_TEL,
  },
  {
    icon: "✉️",
    title: "Email",
    details: EMAIL,
    action: `mailto:${EMAIL}`,
  },
  {
    icon: "📍",
    title: "Address",
    details: ADDRESS_DISPLAY,
    action: `https://maps.google.com/?q=${MAP_Q}`,
  },
  {
    icon: "🕒",
    title: "Office Hours",
    details: "Mon-Sat: 9:00 AM - 7:00 PM\nSunday: By Appointment",
    action: null,
  },
];

type ContactPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default function ContactPage({ searchParams = {} }: ContactPageProps) {
  const parsedLeadContext = enquiryLeadContextSchema.safeParse({
    source: getSingleSearchParam(searchParams.source),
    challenge: getSingleSearchParam(searchParams.challenge),
    track: getSingleSearchParam(searchParams.track),
    relatedCourse: getSingleSearchParam(searchParams.relatedCourse),
  });
  const leadContext: EnquiryLeadContext | undefined =
    parsedLeadContext.success && parsedLeadContext.data.source === "lab"
      ? parsedLeadContext.data
      : undefined;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your coding journey? We&#39;re here to help you choose the right course 
            and answer all your questions about our programs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{info.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-gray-600 whitespace-pre-line">
                          {info.details}
                        </p>
                        {info.action && (
                          <a
                            href={info.action}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                            target={info.action.startsWith('http') ? '_blank' : undefined}
                            rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {info.action.startsWith('tel:') ? 'Call Now' :
                             info.action.startsWith('mailto:') ? 'Send Email' :
                             info.action.startsWith('http') ? 'View on Map' : 'Contact'}
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Lightweight Map Embed */}
                <div className="mt-4 aspect-video overflow-hidden rounded-xl ring-1 ring-gray-200">
                  <iframe
                    title="Doon Coding Academy map (Herbertpur, Dehradun district)"
                    src="https://www.google.com/maps?q=Near+DR+School,+Herbertpur+(Dehradun+district)&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  href="https://wa.me/917037905464?text=Hi, I want to know more about your courses"
                  variant="primary"
                  className="w-full justify-center"
                >
                  💬 Chat on WhatsApp
                </Button>
                <Button
                  href="tel:+917037905464"
                  variant="secondary"
                  className="w-full justify-center"
                >
                  📞 Call Now
                </Button>
                <Button
                  href="/courses"
                  variant="ghost"
                  className="w-full justify-center"
                >
                  📚 View Courses
                </Button>
              </div>
            </Card>

            {/* Response Time */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Quick Response
                  </h3>
                  <p className="text-blue-700 text-sm">
                    We typically respond within 2-4 hours during business hours
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <EnquiryForm leadContext={leadContext} />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What are the batch sizes?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Contact us for current class-size details.
                </p>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you provide placement assistance?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Contact us to confirm whether internship or placement support is currently available.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I pay in installments?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Course pages list pricing options. Contact us to confirm the current payment terms for a course.
                </p>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if I miss a class?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Contact us to ask what catch-up options are currently available for your course.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button href="/faq" variant="ghost">
                View All FAQs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
