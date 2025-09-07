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
            <Script id="ga4-click-events" strategy="afterInteractive">
            {`
              (function () {
                if (!window.gtag) return;

                function send(eventName, params) {
                  try { window.gtag('event', eventName, params || {}); } catch (_) {}
                }

                function handler(e) {
                  var el = e.target;
                  if (!(el instanceof Element)) return;
                  var a = el.closest('a');
                  if (!a) return;

                  var href = (a.getAttribute('href') || '').trim();
                  if (!href) return;

                  var lowerHref = href.toLowerCase();
                  var text = (a.textContent || '').trim().toLowerCase();
                  var page_path = location.pathname;

                  // 1) Phone clicks
                  if (lowerHref.startsWith('tel:')) {
                    var phone = lowerHref.replace('tel:', '').replace(/[^0-9+]/g, '');
                    send('contact_click', { method: 'tel', value: phone, page_path });
                    return;
                  }

                  // 2) WhatsApp clicks
                  if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp')) {
                    send('contact_click', { method: 'whatsapp', href, page_path });
                    return;
                  }

                  // 3) Directions / Maps clicks
                  if (lowerHref.includes('maps.app.goo.gl') || lowerHref.includes('goo.gl/maps') || lowerHref.includes('/maps')) {
                    send('contact_click', { method: 'directions', href, page_path });
                    return;
                  }

                  // 4) Enroll / Consultation CTAs (match by visible text)
                  if (/enroll|consultation/.test(text)) {
                    send('cta_click', { cta: text.slice(0, 60), href, page_path });
                    return;
                  }
                }

                document.addEventListener('click', handler, true);
              })();
            `}
            </Script>
          </>
        ) : null}
        {/* WebSite + SearchAction */}

        {/* WebSite + SearchAction (schema.org) */}
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

        {/* Organization (EducationalOrganization) schema.org */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "@id": `${siteUrl.replace(/\/$/, "")}/#organization`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: siteUrl,
              email: "dooncodingacademy@gmail.com",
              foundingDate: "2019-01-01",
              founder: {
                "@type": "Person",
                name: "Ayush Darmora",
                jobTitle: "Founder & Instructor",
              },
              sameAs: [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean),
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+917037905464",
                contactType: "customer support",
                areaServed: "IN",
                availableLanguage: ["en", "hi"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Near DR School, Herbertpur",
                addressLocality: "Dehradun",
                addressRegion: "Uttarakhand",
                postalCode: "248142",
                addressCountry: "IN",
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
            const sameAs = [
              process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
              process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
              process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
              process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
            ].filter(Boolean);

            return {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${base}/#localbusiness`,
              name: "Doon Coding Academy",
              url: base,
              ...(sameAs.length ? { sameAs } : {}),
              telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917037905464",
              email: "dooncodingacademy@gmail.com",
              hasMap: process.env.NEXT_PUBLIC_GBP_URL || "https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9",
              priceRange: "₹2000–₹30000",
              paymentAccepted: "Cash, UPI, Debit Card, Credit Card, Net Banking, Wallets (Paytm, PhonePe, GPay), EMI",
              image: [`${base}/images/Doon-Coding-Academy-Logo.png`],
              logo: `${base}/images/Doon-Coding-Academy-Logo.png`,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Near DR School, Herbertpur",
                addressLocality: "Dehradun",
                addressRegion: "Uttarakhand",
                postalCode: "248142",
                addressCountry: "IN"
              },
              areaServed: [
                { "@type": "Place", "name": "Dakpathar" },
                { "@type": "Place", "name": "Herbertpur" },
                { "@type": "Place", "name": "Paonta-Sahib" },
                { "@type": "Place", "name": "Vikasnagar" },
                { "@type": "Place", "name": "Sehespur" },
                { "@type": "Place", "name": "Selaqui" },
                { "@type": "Place", "name": "Suddhowala" },
                { "@type": "Place", "name": "Premnagar" },
                { "@type": "City",  "name": "Dehradun" }
              ],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Wednesday","Thursday","Friday","Saturday","Sunday"],
                  opens: "10:00",
                  closes: "19:00"
                }
              ],
              foundingDate: "2019",
              founder: {
                "@type": "Person",
                name: "Ayush Darmora",
                jobTitle: "Founder & Instructor"
              },
              knowsAbout: [
                "Full-Stack Development",
                "Gen AI",
                "Data Science",
                "Python",
                "Java",
                "Coding Classes in Dehradun"
              ]
            };
          })())
        }}
      />
      </body>
    </html>
  );
}
