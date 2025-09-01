import { faqs } from "@/lib/faq";
import { generateFAQPageSchema } from "@/lib/schema";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about Doon Coding Academy, our courses, fees, and more.",
};

export default function FAQPage() {
  const faqSchema = generateFAQPageSchema(faqs);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
      <Script
        id="faqpage-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}


