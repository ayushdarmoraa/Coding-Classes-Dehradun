import { Course } from "./courses";
import { parsePricing } from "./pricing";
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
      "address": "Herbertpur (Dehradun district), Uttarakhand"
    },
    "duration": course.duration,
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "INR"
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
) {
  const variant = opts?.variant ?? "offline";
  const city = opts?.city ?? "Dehradun";
  const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const base = rawBase.replace(/^http:\/\//, "https://");
  const pathPrefix = (opts?.pathPrefix || "courses").replace(/^\/+|\/+$/g, "");
  const url = `${base}/${pathPrefix}/${course.slug}`;

  const image = opts?.imageUrl || `${base}/og-image.png`;
  const brandLogo = opts?.brandLogoUrl || `${base}/images/doon-coding-academy-logo.webp`;

  // Parse one-time price from canonical pricing string
  let price: number | undefined = undefined;
  try {
    const info = parsePricing(String(course.price || ""), String(course.duration || ""));
    price = info.oneTime > 0 ? info.oneTime : undefined;
  } catch {
    const m = String(course.price || "").match(/₹?\s*([\d,]+)/);
    price = m ? Number(m[1].replace(/,/g, "")) : undefined;
  }

  // Optional ISO 8601 duration, e.g., "6 months" => "P6M"
  const timeRequired = (() => {
    if (!course.duration) return undefined;
    const txt = String(course.duration).toLowerCase();
    const range = txt.match(/(\d+)\s*[–-]\s*(\d+)\s*month/);
    if (range) return `P${parseInt(range[2], 10) || 1}M`;
    const single = txt.match(/(\d+)\s*month/);
    if (single) return `P${parseInt(single[1], 10) || 1}M`;
    const weeks = txt.match(/(\d+)\s*week/);
    if (weeks) return `P${(parseInt(weeks[1], 10) || 1) * 7}D`;
    return undefined;
  })();

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
    audience: { "@type": "Audience", audienceType: "Beginners and Intermediates" },
    areaServed,
    image,
    brand: { "@type": "Brand", name: "Doon Coding Academy", logo: brandLogo },
    sameAs: [
      "https://g.page/r/CdcaDehradun",
      "https://facebook.com/dooncodingacademy",
      "https://linkedin.com/company/dooncodingacademy",
    ],
    ...(timeRequired ? { timeRequired } : {}),
    provider: {
      "@type": "EducationalOrganization",
      name: "Doon Coding Academy",
      url: base,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      ...(typeof price === "number" ? { price } : {}),
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
          "@id": `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "").replace(/^http:\/\//, "https://")}/#localbusiness`
        },
      },
    })),
  };
}
