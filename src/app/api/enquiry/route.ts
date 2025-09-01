import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

async function sendEnquiryNotification(enquiry: any) {
  console.log('Sending enquiry notification:', enquiry);
  // TODO: Implement actual email sending using Nodemailer or similar if SMTP envs are configured
  // if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  //   // Example with nodemailer (requires installation: npm install nodemailer)
  //   const nodemailer = require('nodemailer');
  //   let transporter = nodemailer.createTransport({
  //     host: process.env.SMTP_HOST,
  //     port: process.env.SMTP_PORT || 587,
  //     secure: false, // true for 465, false for other ports
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASS,
  //     },
  //   });
  //   await transporter.sendMail({
  //     from: process.env.SMTP_USER, // sender address
  //     to: process.env.CONTACT_EMAIL, // list of receivers
  //     subject: `New Enquiry from ${enquiry.name} - ${enquiry.course}`,
  //     text: `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nCourse: ${enquiry.course}\nMessage: ${enquiry.message}\nTimestamp: ${enquiry.timestamp}`,
  //     html: `<p><b>Name:</b> ${enquiry.name}</p><p><b>Email:</b> ${enquiry.email}</p><p><b>Phone:</b> ${enquiry.phone}</p><p><b>Course:</b> ${enquiry.course}</p><p><b>Message:</b> ${enquiry.message}</p><p><b>Timestamp:</b> ${enquiry.timestamp}</p>`,
  //   });
  // }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, course, message } = body;
    
    // Validation
    if (!name || !email || !phone || !course) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Store enquiry
    const enquiry = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      course,
      message: message || '', // message is optional
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    await mkdir(dataDir, { recursive: true });

    // Save to JSON file
    const enquiriesPath = path.join(dataDir, 'enquiries.json');
    
    let existingEnquiries = [];
    try {
      const existingData = await readFile(enquiriesPath, 'utf8');
      existingEnquiries = JSON.parse(existingData);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty array
        existingEnquiries = [];
      } else {
        throw error; // Re-throw other errors
      }
    }
    
    existingEnquiries.push(enquiry);
    await writeFile(enquiriesPath, JSON.stringify(existingEnquiries, null, 2));
    
    // Send notification email (placeholder)
    await sendEnquiryNotification(enquiry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry submitted successfully' 
    });
  } catch (error) {
    console.error('Enquiry submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


