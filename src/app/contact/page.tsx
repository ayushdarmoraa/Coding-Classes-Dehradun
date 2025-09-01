import type { Metadata } from "next";
import EnquiryForm from "@/components/features/EnquiryForm";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact Us - Doon Coding Academy",
  description: "Get in touch with Doon Coding Academy. Contact us for course enquiries, admissions, and more information about our coding programs in Dehradun.",
  alternates: { canonical: "/contact" },
};

const contactInfo = [
  {
    icon: "📞",
    title: "Phone & WhatsApp",
    details: "+91 7037905464",
    action: "tel:+917037905464"
  },
  {
    icon: "✉️",
    title: "Email",
    details: "dooncodingacademy@gmail.com",
    action: "mailto:dooncodingacademy@gmail.com"
  },
  {
    icon: "📍",
    title: "Address",
    details: "Near DR School, Herbertpur, Dehradun, PIN 248142",
    action: "https://maps.google.com/?q=Near+DR+School+Herbertpur+Dehradun"
  },
  {
    icon: "🕒",
    title: "Office Hours",
    details: "Mon-Sat: 9:00 AM - 7:00 PM\nSunday: By Appointment",
    action: null
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your coding journey? We're here to help you choose the right course 
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
            <EnquiryForm />
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
                  We maintain small batch sizes of maximum 15 students to ensure personalized attention and better learning outcomes.
                </p>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you provide placement assistance?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, we provide comprehensive placement assistance including resume building, interview preparation, and job referrals.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I pay in installments?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, we offer flexible payment options including monthly installments for all our courses.
                </p>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if I miss a class?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We provide recorded sessions and makeup classes to ensure you don't miss any important content.
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
    </div>
  );
}

