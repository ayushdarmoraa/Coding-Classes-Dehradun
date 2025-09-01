// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Doon Coding Academy",
    template: "%s | Doon Coding Academy",
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.",
  openGraph: {
    title: "Doon Coding Academy",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "Doon Coding Academy",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const BUSINESS_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";

  const ORG_JSONLD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    sameAs: [
      // add social links when available
    ],
  };

  const LOCAL_JSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    url: SITE_URL,
    telephone: process.env.NEXT_PUBLIC_PHONE || "+91 7037905464",
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_ADDRESS_STREET || "Near DR School, Herbertpur",
      addressLocality: process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun",
      addressRegion: process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand",
      postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || "248142",
      addressCountry: "IN",
    },
    image: [`${SITE_URL}/favicon.ico`],
  };

  return (
    <html lang="en">
      <body>
        {children}

        <Script
          id="org-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <Script
          id="localbusiness-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_JSONLD) }}
        />
      </body>
    </html>
  );
}
