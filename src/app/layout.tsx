import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
      </body>
    </html>
  );
}
