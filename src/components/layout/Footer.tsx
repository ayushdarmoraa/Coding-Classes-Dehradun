import Link from "next/link";

export default function Footer() {
  const BUSINESS_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";
  const PHONE = process.env.NEXT_PUBLIC_PHONE || "+91 7037905464";
  const ADDRESS_STREET = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Near DR School, Herbertpur";
  const ADDRESS_LOCALITY = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
  const ADDRESS_REGION = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
  const POSTAL_CODE = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";

  return (
    <footer className="bg-gray-800 text-white p-8 mt-8">
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-bold mb-2">{BUSINESS_NAME}</h3>
        <p className="text-sm mb-1">
          {ADDRESS_STREET}, {ADDRESS_LOCALITY}, {ADDRESS_REGION} {POSTAL_CODE}, India
        </p>
        <p className="text-sm mb-4">Phone: {PHONE}</p>
        <p className="text-sm mb-4">
          <Link href="/rss.xml" className="hover:underline" target="_blank" rel="noopener noreferrer">
            RSS Feed
          </Link>
        </p>
        {/* Assuming social media links will be added here. Example: */}
        {/* <div className="flex justify-center space-x-4 mt-4">
          <a href="https://facebook.com/dooncodingacademy" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <img src="/images/social/facebook.svg" alt="Facebook" className="h-6 w-6" />
          </a>
          <a href="https://instagram.com/dooncodingacademy" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/images/social/instagram.svg" alt="Instagram" className="h-6 w-6" />
          </a>
        </div> */}
        <p className="text-xs">&copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}


