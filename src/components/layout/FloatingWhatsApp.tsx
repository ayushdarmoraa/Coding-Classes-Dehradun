import { SITE } from "@/lib/site-config";

export default function FloatingWhatsApp() {
  return (
    <a
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in a new tab)"
      className="whatsapp-float flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3.2A12.7 12.7 0 0 0 5.1 22.35L3.4 28.6l6.4-1.68A12.72 12.72 0 1 0 16.04 3.2Zm0 23.1a10.3 10.3 0 0 1-5.25-1.44l-.38-.23-3.8 1 1.02-3.7-.25-.39a10.36 10.36 0 1 1 8.66 4.76Zm5.68-7.75c-.31-.16-1.84-.91-2.13-1.02-.29-.1-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.68.08-.32-.16-1.34-.5-2.54-1.57-.94-.84-1.58-1.88-1.77-2.2-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.55-.08-.16-.71-1.7-.98-2.33-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.31-1.1 1.07-1.1 2.62s1.13 3.04 1.29 3.25c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.45.2 2 .12.61-.09 1.84-.76 2.1-1.49.26-.74.26-1.37.18-1.5-.08-.14-.29-.22-.6-.37Z" />
      </svg>
    </a>
  );
}
