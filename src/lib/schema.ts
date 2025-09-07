import { Course } from "./courses";
import { Testimonial } from "./testimonials"; // Import Testimonial interface

export function generateOrganizationSchema(siteUrl: string, businessName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    sameAs: [
      // add social links when available
    ],
  };
}

export function generateLocalBusinessSchema(
  siteUrl: string,
  businessName: string,
  phone: string,
  streetAddress: string,
  addressLocality: string,
  addressRegion: string,
  postalCode: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: businessName,
    url: siteUrl,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: streetAddress,
      addressLocality: addressLocality,
      addressRegion: addressRegion,
      postalCode: postalCode,
      addressCountry: "IN",
    },
    image: [`${siteUrl}/favicon.ico`],
  };
}

export function generateCourseSchema(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Doon Coding Academy"
    },
    "courseMode": "Blended",
    "location": {
      "@type": "Place",
      "address": "Herbertpur, Dehradun, Uttarakhand"
    },
    "duration": course.duration,
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "INR"
    }
  }
}

export function generateFAQPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateTestimonialSchema(testimonials: Testimonial[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: testimonials.map((testimonial, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@context": "https://schema.org",
        "@type": "Review",
        author: { "@type": "Person", name: testimonial.author },
        datePublished: testimonial.datePublished || new Date().toISOString().split("T")[0], // Use provided date or current date
        reviewBody: testimonial.text,
        name: testimonial.course || "Student Testimonial", // Use course name or generic
        reviewRating: testimonial.rating ? { "@type": "Rating", ratingValue: String(testimonial.rating), bestRating: "5" } : undefined,
        itemReviewed: {
          "@type": "LocalBusiness",
          "@id": "https://www.dooncodingacademy.in/#localbusiness"
        },
      },
    })),
  };
}


