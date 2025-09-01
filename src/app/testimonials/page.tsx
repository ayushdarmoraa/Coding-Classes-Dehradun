import { testimonials } from "@/lib/testimonials";
import { generateTestimonialSchema } from "@/lib/schema";
import Script from "next/script";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Student Testimonials",
  description: "Read what our students have to say about Doon Coding Academy and their learning experience.",
};

export default function TestimonialsPage() {
  const testimonialSchema = generateTestimonialSchema(testimonials);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Student Testimonials</h1>
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm flex items-start space-x-4">
            {testimonial.image && testimonial.altText && (
              <Image
                src={testimonial.image}
                alt={testimonial.altText}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            )}
            <div className="flex-grow">
              <p className="text-gray-700 italic">\"{testimonial.text}\"</p>
              <p className="text-right font-semibold mt-2">- {testimonial.author}</p>
              {testimonial.rating && (
                <div className="flex justify-end mt-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.565-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
              {testimonial.source && (
                <p className="text-sm text-gray-500 text-right">Source: {testimonial.source}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <Script
        id="testimonial-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialSchema) }}
      />
    </div>
  );
}


