import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

// Build a single, normalized site URL we can reuse everywhere
const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const siteUrl = rawBase.replace(/^http:\/\//, "https://");

export const metadata: Metadata = {
  // Global canonical base for all routes
  metadataBase: new URL(siteUrl),

  title: { default: "Doon Coding Academy", template: "%s | Doon Coding Academy" },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.",

  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,

  // IMPORTANT: do NOT set a root-level canonical here,
  // or every page will canonicalize to "/".
  // Page-level files can define their own `alternates.canonical` if needed.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
  <Header />
        {children}
        <Footer />

        {/* GA4 (gated by env var; no-op if env is missing) */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true, transport_type: 'beacon' });
              `}
            </Script>
          </>
        ) : null}
        {/* WebSite + SearchAction */}
        {/* eslint-disable-next-line react/no-danger */}
        <Script
          id="website-searchaction"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteUrl.replace(/\/$/, "")}/#website`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl.replace(/\/$/, "")}/blog?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Organization / EducationalOrganization */}
        {/* eslint-disable-next-line react/no-danger */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: siteUrl,
              sameAs: [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean),
              address: {
                "@type": "PostalAddress",
                streetAddress: "Near DR School, Herbertpur",
                addressLocality: process.env.NEXT_PUBLIC_ADDRESS_CITY || "Dehradun",
                addressRegion: process.env.NEXT_PUBLIC_ADDRESS_STATE || "Uttarakhand",
                postalCode: "248142",
                addressCountry: "IN", // ← added
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || undefined,
                contactType: "customer support",
                areaServed: "IN",
                availableLanguage: ["en", "hi"],
              },
            }),
          }}
        />

        {/* Close mobile menu after navigation / interactions */}
        <Script
          id="close-mobile-menu"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
      function closeMenu() {
        var cb = document.getElementById('nav-toggle');
        if (cb && cb.checked) cb.checked = false;
      }

      // Close when any header/mobile-menu link is clicked
      document.addEventListener('click', function (e) {
        var el = e.target;
        if (!(el instanceof Element)) return;
        var anchor = el.closest('a');
        if (!anchor) return;
        if (anchor.closest('header') || anchor.closest('#mobile-menu')) closeMenu();
      }, true);

      // Close on back/forward, and hash changes
      window.addEventListener('popstate', closeMenu);
      window.addEventListener('hashchange', closeMenu);

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    })();`,
          }}
        />
      {/* LocalBusiness JSON-LD for Local SEO */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify((() => {
            const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dooncodingacademy.in").replace(/\/$/, "");
            return {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${base}/#localbusiness`,
              "name": "Doon Coding Academy",
              "url": base,
              "telephone": process.env.NEXT_PUBLIC_CONTACT_PHONE || undefined, // ← added
              "priceRange": "₹2000–₹30000",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Near DR School, Herbertpur",
                "addressLocality": "Dehradun",
                "addressRegion": "Uttarakhand",
                "postalCode": "248142",
                "addressCountry": "IN"
              },
              "areaServed": [{ "@type": "City", "name": "Dehradun" }],
              "knowsAbout": [
                "Full-Stack Development",
                "Gen AI",
                "Data Science",
                "Python",
                "Java",
                "Coding Classes in Dehradun"
              ],
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
                  ],
                  "opens": "09:00",
                  "closes": "19:00"
                }
              ]
            };
          })())
        }}
      />
      </body>
    </html>
  );
}
