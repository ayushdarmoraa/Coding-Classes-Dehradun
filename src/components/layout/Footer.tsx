/* eslint-disable @next/next/no-html-link-for-pages */
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand + Address */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">&lt;DCA/&gt; Doon Coding Academy</h3>
          <p className="text-sm">
            Near DR School, Herbertpur<br />
            Dehradun, Uttarakhand 248142, India
          </p>
          <p className="mt-2 text-sm">📞 +91 7037905464</p>
          <p className="text-sm">✉️ dooncodingacademy@gmail.com</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/courses" className="hover:text-white">Courses</a></li>
            <li><a href="/blog" className="hover:text-white">Blog</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Connect With Us</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wa.me/917037905464" target="_blank" className="hover:text-white" rel="noreferrer">WhatsApp</a></li>
            <li><a href="https://facebook.com" target="_blank" className="hover:text-white" rel="noreferrer">Facebook</a></li>
            <li><a href="https://instagram.com" target="_blank" className="hover:text-white" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Doon Coding Academy. All rights reserved.
      </div>
    </footer>
  );
}


