import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Doon Coding Academy',
  description: 'Leading coding institute in Dehradun offering Full‑Stack, Data Science, Python and Java courses.',
  keywords: ['coding academy', 'Dehradun', 'full stack', 'data science', 'python', 'java'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b shadow-sm sticky top-0 bg-white z-50">
          <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
            <a href="/" className="text-xl font-bold">Doon Coding Academy</a>
            <ul className="flex gap-4">
              <li><a href="/about" className="hover:underline">About</a></li>
              <li><a href="/courses" className="hover:underline">Courses</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
        <footer className="mt-8 py-4 border-t text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Doon Coding Academy. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
