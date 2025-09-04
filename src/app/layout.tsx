import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: { default: "Doon Coding Academy", template: "%s | Doon Coding Academy" },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
  <Header />
        {children}
        <Footer />
        <Script
          id="website-searchaction"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
              potentialAction: {
                "@type": "SearchAction",
                target: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/blog?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
              sameAs: [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean),
              address: {
                "@type": "PostalAddress",
                streetAddress: process.env.NEXT_PUBLIC_ADDRESS_LINE1 || undefined,
                addressLocality: process.env.NEXT_PUBLIC_ADDRESS_CITY || "Dehradun",
                addressRegion: process.env.NEXT_PUBLIC_ADDRESS_STATE || "Uttarakhand",
                postalCode: process.env.NEXT_PUBLIC_ADDRESS_ZIP || undefined,
                addressCountry: process.env.NEXT_PUBLIC_ADDRESS_COUNTRY || "IN",
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
      </body>
    </html>
  );
}
