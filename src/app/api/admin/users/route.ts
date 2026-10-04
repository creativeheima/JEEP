import { NextResponse } from 'next/server';
import {
  getSafeAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/accountStore';
import { requireSession } from '@/lib/apiAuth';

// GET: Ambil daftar seluruh akun admin
export async function GET(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const accounts = await getSafeAccounts();
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data akun' },
      { status: 500 }
    );
  }
}

// POST: Tambah akun baru
export async function POST(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { username, name, email, role, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, Email, dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    const result = await createAccount({
      username,
      name: name || username,
      email,
      role: role === 'SUPERUSER' ? 'SUPERUSER' : 'ADMIN',
      password,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${username} berhasil dibuat sebagai ${result.account?.role}!`,
      data: result.account,
    });
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal membuat akun' },
      { status: 500 }
    );
  }
}

// PUT: Perbarui data akun (nama, email, role, password, status aktif)
export async function PUT(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id, name, email, username, role, password, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID akun wajib disertakan!' },
        { status: 400 }
      );
    }

    const result = await updateAccount(id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(username !== undefined && { username }),
      ...(role !== undefined && { role: role === 'SUPERUSER' ? 'SUPERUSER' : 'ADMIN' }),
      ...(password !== undefined && { password }),
      ...(isActive !== undefined && { isActive }),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data akun berhasil diperbarui!',
      data: result.account,
    });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui akun' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus akun
export async function DELETE(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID akun wajib disertakan!' },
        { status: 400 }
      );
    }

    if (id === auth.uid) {
      return NextResponse.json({ success: false, error: 'Tidak bisa menghapus akun yang sedang dipakai login.' }, { status: 400 });
    }
    const result = await deleteAccount(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus!',
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus akun' },
      { status: 500 }
    );
  }
}
