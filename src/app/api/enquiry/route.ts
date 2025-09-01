import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Validation schema
const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  course: z.string().min(1, 'Please select a course'),
  message: z.string().optional()
});

type EnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  course: string;
  message?: string;
};

async function sendEnquiryNotification(enquiry: EnquiryPayload & { id: string; timestamp: string; status: string }) {
  console.log('Sending enquiry notification:', enquiry);
  
  // If SMTP environment variables are configured, send email
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      // Note: In production, you would install and use nodemailer here
      console.log('SMTP configured - would send email to:', process.env.CONTACT_EMAIL || 'dooncodingacademy@gmail.com');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
  const body = (await request.json()) as EnquiryPayload;
    
    // Validate request body with Zod
    const validationResult = enquirySchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors 
        },
        { status: 400 }
      );
    }
    
    const { name, email, phone, course, message } = validationResult.data;
    
    // Create enquiry object
    const enquiry = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      course,
      message: message || '',
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    await mkdir(dataDir, { recursive: true });

    // Save to JSON file (in development) or database (in production)
    const enquiriesPath = path.join(dataDir, 'enquiries.json');
    
    let existingEnquiries: Array<EnquiryPayload & { id: string; timestamp: string; status: string }> = [];
    try {
      const existingData = await readFile(enquiriesPath, 'utf8');
      existingEnquiries = JSON.parse(existingData) as Array<EnquiryPayload & { id: string; timestamp: string; status: string }>;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
        existingEnquiries = [];
      } else {
        throw error;
      }
    }
    
    existingEnquiries.push(enquiry);
    await writeFile(enquiriesPath, JSON.stringify(existingEnquiries, null, 2));
    
    // Send notification
    await sendEnquiryNotification(enquiry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your enquiry! We will contact you within 24 hours.',
      enquiryId: enquiry.id
    });
    
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Enquiry submission error:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: msg || 'Something went wrong. Please try again or contact us directly.' 
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

