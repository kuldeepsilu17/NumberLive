import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide a valid name (at least 2 characters).' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long.' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const saved = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : 'Public Inquiry',
        message: message.trim(),
        ipAddress,
        status: 'UNREAD',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received. Our editorial team will review it shortly.',
      id: saved.id,
    });
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry. Please try again later.' }, { status: 500 });
  }
}
