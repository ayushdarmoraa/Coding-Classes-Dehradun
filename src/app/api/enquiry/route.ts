import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, phone, course, message } = await request.json();
    // Here, you could store the enquiry or send an email notification
    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error submitting enquiry' }, { status: 500 });
  }
}
