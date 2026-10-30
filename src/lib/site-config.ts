const defaultPhone = "+91 7037905464";
const phone = process.env.NEXT_PUBLIC_PHONE || defaultPhone;

function normalizeSiteUrl(value: string | undefined): string {
  return (value || "https://dooncodingacademy.in")
    .replace(/\/$/, "")
    .replace(/^http:\/\//, "https://")
    .replace(/^https:\/\/www\./, "https://");
}

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Leading coding institute in Dehradun – Full Stack with Gen AI, Data Science, Python, Java.",
  phone,
  email: process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com",
  whatsappUrl: `https://wa.me/${phone.replace(/\D/g, "")}`,
};
