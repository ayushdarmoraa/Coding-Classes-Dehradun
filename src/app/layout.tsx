import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      process.NEXT_PUBLIC_SITE_DESCRIPTION ||
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
  const PHONE = process.env.NEXT_PUBLIC_PHONE || "+91 7037905464";
  const ADDRESS_STREET = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Near DR School, Herbertpur";
  const ADDRESS_LOCALITY = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
  const ADDRESS_REGION = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
  const POSTAL_CODE = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";

  const ORG_JSONLD = generateOrganizationSchema(SITE_URL, BUSINESS_NAME);
  // Add social links to ORG_JSONLD when ready
  // ORG_JSONLD.sameAs = ["https://facebook.com/dooncodingacademy", "https://instagram.com/dooncodingacademy"];

  const LOCAL_JSONLD = generateLocalBusinessSchema(
    SITE_URL,
    BUSINESS_NAME,
    PHONE,
    ADDRESS_STREET,
    ADDRESS_LOCALITY,
    ADDRESS_REGION,
    POSTAL_CODE
  );

  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />

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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}


