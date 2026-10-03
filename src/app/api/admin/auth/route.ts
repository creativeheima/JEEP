import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/accountStore';
import { ADMIN_CREDENTIALS } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan kata sandi wajib diisi!' },
        { status: 400 }
      );
    }

    // Coba otentikasi melalui account store
    let user = authenticateUser(username, password);

    // Fallback kompatibilitas kredensial bawaan admin
    if (!user) {
      const isValidFallback =
        (username === ADMIN_CREDENTIALS.username || username === ADMIN_CREDENTIALS.email) &&
        password === ADMIN_CREDENTIALS.password;

      if (isValidFallback) {
        user = {
          id: 'usr-default-admin',
          username: ADMIN_CREDENTIALS.username,
          name: 'Admin Basecamp',
          email: ADMIN_CREDENTIALS.email,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau kata sandi tidak cocok!' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Akun Anda dinonaktifkan oleh Superuser!' },
        { status: 403 }
      );
    }

    const token = 'mja_auth_' + Date.now();
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
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
      { success: false, error: 'Terjadi kesalahan internal sistem' },
      { status: 500 }
    );
  }
}
