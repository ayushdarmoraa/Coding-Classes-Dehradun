import { useState } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      course: formData.get('course'),
      message: formData.get('message'),
    }
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      setStatus(result.message as string)
    } catch (error) {
      setStatus('Sorry, something went wrong.')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p>Have questions or want to enquire about a course? Fill out the form below and we’ll get back to you.</p>
      {status && <p className="p-2 bg-green-100 border border-green-300 rounded">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
          <input type="tel" id="phone" name="phone" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="course">Course of Interest</label>
          <select id="course" name="course" className="w-full border rounded px-3 py-2">
            <option value="Full‑Stack">Full‑Stack</option>
            <option value="Data Science">Data Science</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Submit
        </button>
      </form>
    </div>
  )
}
