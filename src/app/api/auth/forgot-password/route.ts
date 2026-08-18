import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requestPasswordReset } from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const result = await requestPasswordReset(email);

    if (result.sent) {
      const baseUrl = process.env.APP_URL || request.nextUrl.origin;
      const resetUrl = `${baseUrl}/reset-password?token=${result.token}`;
      return NextResponse.json({
        message: 'A password reset link has been generated.',
        resetUrl,
        email: result.email,
      });
    }

    // Always return the same message to avoid leaking which emails exist.
    return NextResponse.json({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[auth] forgot-password failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
