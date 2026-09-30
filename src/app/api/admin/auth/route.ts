import { NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const isValidUser =
      (username === ADMIN_CREDENTIALS.username || username === ADMIN_CREDENTIALS.email) &&
      password === ADMIN_CREDENTIALS.password;

    if (!isValidUser) {
      return NextResponse.json(
        { success: false, error: 'Username atau password admin salah!' },
        { status: 401 }
      );
    }

    const token = 'mja_auth_' + Date.now();
    const response = NextResponse.json({
      success: true,
      user: {
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: 'Super Admin Basecamp',
      },
      token,
    });

    response.cookies.set('mja_admin_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
