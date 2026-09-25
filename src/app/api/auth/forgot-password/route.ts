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
      return NextResponse.json({
        message: 'A temporary password has been sent to your email.',
        email: result.email,
        name: result.name,
      });
    }

    if (result.reason === 'email_failed') {
      return NextResponse.json(
        {
          error:
            'The temporary password could not be emailed right now. The SMTP configuration may be incorrect. Please contact the administrator.',
        },
        { status: 500 }
      );
    }

    // Account not found — return the same message to avoid leaking which emails exist.
    return NextResponse.json({
      message:
        'If an account exists for that email, a temporary password has been sent.',
    });
  } catch (error) {
    console.error('[auth] forgot-password failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
