import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resetPassword } from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body?.token || '');
    const password = String(body?.password || '');

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Reset token and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const user = await resetPassword(token, password);
    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[auth] reset-password failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
