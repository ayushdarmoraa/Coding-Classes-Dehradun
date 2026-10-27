import { isCourseModeAvailable, type Course } from "./courses";
import { courseDurationToIso, formatCourseDuration } from "./pricing";
import { SITE } from "./site-config";
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
    ...(course.modeStatus === "confirmed" ? { courseMode: course.modes } : {}),
    duration: formatCourseDuration(course.duration),
    "offers": {
      "@type": "Offer",
      price: course.pricing.packageRate,
      priceCurrency: course.pricing.currency,
      description: `${formatCourseDuration(course.duration)} package rate`,
      ...(course.pricing.monthlyRate === undefined
        ? {}
        : {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: course.pricing.monthlyRate,
              priceCurrency: course.pricing.currency,
              unitText: "month",
            },
          }),
    }
  }
}

/**
 * Build enriched Course JSON-LD from a Course record.
 * Defaults to offline (Onsite) variant with Dehradun area served.
 */
export function getCourseJsonLd(
  course: Course,
  opts?: {
    variant?: "offline" | "online";
    city?: string; // for offline variant display in areaServed
    imageUrl?: string;
    brandLogoUrl?: string;
    pathPrefix?: string; // default: "courses" (override for online pages)
  }
): Record<string, unknown> | null {
  const variant = opts?.variant ?? "offline";
  const requiredMode = variant === "online" ? "Online" : "On-Campus";
  if (!isCourseModeAvailable(course, requiredMode)) return null;

  const city = opts?.city ?? "Dehradun";
  const base = SITE.url;
  const pathPrefix = (opts?.pathPrefix || "courses").replace(/^\/+|\/+$/g, "");
  const url = `${base}/${pathPrefix}/${course.slug}`;

  const image = opts?.imageUrl || `${base}/og-image.png`;
  const brandLogo = opts?.brandLogoUrl || `${base}/images/doon-coding-academy-logo.webp`;

  const areaServed =
    variant === "online"
      ? { "@type": "Place", name: "India" }
      : { "@type": "Place", name: `${city}, India` };

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.title,
    description: course.description,
    url,
    courseCode: course.slug,
    inLanguage: "en",
    educationalCredentialAwarded: "Certificate of Completion",
    areaServed,
    image,
    brand: { "@type": "Brand", name: "Doon Coding Academy", logo: brandLogo },
    sameAs: [
      "https://g.page/r/CdcaDehradun",
      "https://facebook.com/dooncodingacademy",
      "https://linkedin.com/company/dooncodingacademy",
    ],
    timeRequired: courseDurationToIso(course.duration),
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: base,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: course.pricing.currency,
      price: course.pricing.packageRate,
      description: `${formatCourseDuration(course.duration)} package rate`,
      ...(course.pricing.monthlyRate === undefined
        ? {}
        : {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: course.pricing.monthlyRate,
              priceCurrency: course.pricing.currency,
              unitText: "month",
            },
          }),
      availability: "https://schema.org/InStock",
      category: "Paid",
      eligibleRegion: { "@type": "Country", name: "India" },
    },
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        name: course.title,
        url,
        courseMode: variant === "online" ? "Online" : "Onsite",
        courseWorkload: "PT45H",
        ...(variant === "online"
          ? {}
          : {
              location: {
                "@type": "Place",
                name: "Doon Coding Academy",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Near DR School, Herbertpur",
                  addressLocality: "Dehradun",
                  addressRegion: "Uttarakhand",
                  postalCode: "248142",
                  addressCountry: "IN",
                },
              },
            }),
      },
    ],
  };

  return json;
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
  const verifiedTestimonials = testimonials.filter(
    (testimonial) => testimonial.verified && testimonial.consentVerified
  );
  if (verifiedTestimonials.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: verifiedTestimonials.map((testimonial, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@context": "https://schema.org",
        "@type": "Review",
        author: { "@type": "Person", name: testimonial.author },
        ...(testimonial.datePublished ? { datePublished: testimonial.datePublished } : {}),
        reviewBody: testimonial.text,
        name: testimonial.course || "Student Testimonial", // Use course name or generic
        reviewRating: testimonial.rating ? { "@type": "Rating", ratingValue: String(testimonial.rating), bestRating: "5" } : undefined,
        itemReviewed: {
          "@type": "LocalBusiness",
          // Derive stable @id from env, normalized to https and without trailing slash
          "@id": `${SITE.url}/#localbusiness`
        },
      },
    })),
  };
}
