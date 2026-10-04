import { NextResponse } from 'next/server';
import { getDbConfig, getMaskedDbConfig, saveDbConfig, resetDbConfigCache, unmaskSecret, wasLastSavePersisted, isServerlessHosting } from '@/lib/dbConfig';
import { requireSession } from '@/lib/apiAuth';
import { testSupabaseConnection, resetSupabaseCache } from '@/lib/supabase';
import { testMySqlConnection, initMySqlSchema } from '@/lib/mysql';

const MYSQL_SCHEMA_SQL = `-- SKEMA MYSQL UNTUK JEEP MERAPI ADVENTURE
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(100) PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  tour_date VARCHAR(50) NOT NULL,
  tour_time VARCHAR(50) NOT NULL,
  pax_count INT NOT NULL DEFAULT 1,
  jeep_count INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  dp_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Transfer BCA',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  driver_name VARCHAR(150) DEFAULT 'Belum Ditugaskan',
  jeep_number VARCHAR(100) DEFAULT '-',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_items (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'PHOTO',
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'JEEP ACTION',
  media_url TEXT NOT NULL,
  instagram_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hero_slides (
  id VARCHAR(100) PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  show_text BOOLEAN NOT NULL DEFAULT TRUE,
  headline VARCHAR(255),
  subheadline VARCHAR(255),
  show_button BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tour_packages (
  id VARCHAR(100) PRIMARY KEY,
  badge VARCHAR(100) DEFAULT '',
  sub_badge VARCHAR(100) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  image VARCHAR(500) NOT NULL,
  destinations JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  feature_text VARCHAR(255),
  color VARCHAR(50) DEFAULT 'slate',
  order_index INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_accounts (
  id VARCHAR(100) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL DEFAULT '',
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
  password_hash VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
  \`key\` VARCHAR(50) PRIMARY KEY,
  value JSON NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collage_content (
  id VARCHAR(50) PRIMARY KEY,
  headline VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image1 TEXT NOT NULL,
  image1_caption VARCHAR(255),
  image2 TEXT NOT NULL,
  image2_caption VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

// GET: Ambil konfigurasi database saat ini (kunci rahasia DISENSOR — tidak pernah dikirim utuh ke browser)
export async function GET(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const config = getMaskedDbConfig();
    return NextResponse.json({ success: true, data: config, serverless: isServerlessHosting() });
  } catch (error: any) {
    console.error('Error getting DB config:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat konfigurasi database' }, { status: 500 });
  }
}

/** Gabungkan input UI dengan nilai tersimpan: field rahasia yang masih tersensor tidak menimpa nilai asli. */
function mergeSecrets(body: any) {
  const current = getDbConfig();
  const sb = body?.supabase;
  const my = body?.mysql;
  return {
    supabase: sb
      ? {
          url: typeof sb.url === 'string' ? sb.url.trim() : current.supabase.url,
          anonKey: typeof sb.anonKey === 'string' ? sb.anonKey.trim() : current.supabase.anonKey,
          serviceRoleKey: unmaskSecret(sb.serviceRoleKey, current.supabase.serviceRoleKey).trim(),
        }
      : undefined,
    mysql: my
      ? {
          host: String(my.host ?? current.mysql.host),
          port: Number(my.port) || current.mysql.port,
          database: String(my.database ?? current.mysql.database),
          user: String(my.user ?? current.mysql.user),
          password: unmaskSecret(my.password, current.mysql.password),
          ssl: Boolean(my.ssl),
        }
      : undefined,
  };
}

// POST: Simpan konfigurasi database
export async function POST(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const activeMode = ['supabase', 'mysql', 'local'].includes(body.activeMode) ? body.activeMode : getDbConfig().activeMode;
    const { supabase: sbConfig, mysql: myConfig } = mergeSecrets(body);

    const ok = saveDbConfig({ activeMode, supabase: sbConfig, mysql: myConfig }, auth.username);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Gagal menyimpan konfigurasi database.' }, { status: 500 });
    }

    resetDbConfigCache();
    resetSupabaseCache();
    const persisted = wasLastSavePersisted();

    return NextResponse.json({
      success: true,
      persisted,
      message: persisted
        ? `Konfigurasi database berhasil disimpan! Provider aktif sekarang: ${String(activeMode).toUpperCase()}`
        : `Konfigurasi aktif sementara (${String(activeMode).toUpperCase()}), TAPI tidak tersimpan permanen karena hosting serverless (mis. Vercel). Simpan nilai ini di Environment Variables hosting agar tidak hilang.`,
      data: getMaskedDbConfig(),
    });
  } catch (error: any) {
    console.error('Error saving DB config:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan konfigurasi' }, { status: 500 });
  }
}

// PUT: Aksi Khusus (Test Supabase, Test MySQL, Inisialisasi MySQL, Ambil Skrip SQL)
export async function PUT(request: Request) {
  const auth = await requireSession(request, 'SUPERUSER');
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { action } = body;
    // Payload dari UI bisa berisi kunci tersensor → ganti dengan nilai tersimpan
    const merged = mergeSecrets({ supabase: action === 'test-supabase' ? body.payload : undefined, mysql: action !== 'test-supabase' ? body.payload : undefined });
    const sbPayload = body.payload ? merged.supabase : undefined;
    const myPayload = body.payload ? merged.mysql : undefined;

    if (action === 'test-supabase') {
      const currentConfig = getDbConfig();
      const sbToTest = sbPayload || currentConfig.supabase;
      const testResult = await testSupabaseConnection(sbToTest);
      return NextResponse.json({ success: testResult.success, result: testResult });
    }

    if (action === 'test-mysql') {
      const currentConfig = getDbConfig();
      const myToTest = myPayload || currentConfig.mysql;
      const testResult = await testMySqlConnection(myToTest);
      return NextResponse.json({ success: testResult.success, result: testResult });
    }

    if (action === 'init-mysql-schema') {
      const currentConfig = getDbConfig();
      const myToInit = myPayload || currentConfig.mysql;
      const initResult = await initMySqlSchema(myToInit);
      return NextResponse.json({ success: initResult.success, result: initResult });
    }

    if (action === 'get-schema-sql') {
      return NextResponse.json({
        success: true,
        mysqlSql: MYSQL_SCHEMA_SQL,
      });
    }

    return NextResponse.json({ success: false, error: 'Action tidak dikenal' }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing DB action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan sistem saat pengujian' },
      { status: 500 }
    );
  }
}
