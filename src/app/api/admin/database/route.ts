import { NextResponse } from 'next/server';
import { getDbConfig, saveDbConfig } from '@/lib/dbConfig';
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

// GET: Ambil konfigurasi database saat ini
export async function GET() {
  try {
    const config = getDbConfig();
    return NextResponse.json({
      success: true,
      data: {
        activeMode: config.activeMode,
        supabase: {
          url: config.supabase.url,
          anonKey: config.supabase.anonKey,
          serviceRoleKey: config.supabase.serviceRoleKey,
        },
        mysql: {
          host: config.mysql.host,
          port: config.mysql.port,
          database: config.mysql.database,
          user: config.mysql.user,
          password: config.mysql.password,
          ssl: config.mysql.ssl,
        },
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
      },
    });
  } catch (error: any) {
    console.error('Error getting DB config:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat konfigurasi database' },
      { status: 500 }
    );
  }
}

// POST: Simpan konfigurasi database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activeMode, supabase: sbConfig, mysql: myConfig, updatedBy } = body;

    const ok = saveDbConfig(
      {
        activeMode,
        supabase: sbConfig,
        mysql: myConfig,
      },
      updatedBy || 'superuser'
    );

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Gagal menyimpan file konfigurasi database' },
        { status: 500 }
      );
    }

    // Reset runtime cache client agar konfigurasi baru langsung berlaku
    resetSupabaseCache();

    return NextResponse.json({
      success: true,
      message: `Konfigurasi database berhasil disimpan! Provider aktif sekarang: ${activeMode.toUpperCase()}`,
      data: getDbConfig(),
    });
  } catch (error: any) {
    console.error('Error saving DB config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan konfigurasi' },
      { status: 500 }
    );
  }
}

// PUT: Aksi Khusus (Test Supabase, Test MySQL, Inisialisasi MySQL, Ambil Skrip SQL)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'test-supabase') {
      const currentConfig = getDbConfig();
      const sbToTest = payload || currentConfig.supabase;
      const testResult = await testSupabaseConnection(sbToTest);
      return NextResponse.json({ success: testResult.success, result: testResult });
    }

    if (action === 'test-mysql') {
      const currentConfig = getDbConfig();
      const myToTest = payload || currentConfig.mysql;
      const testResult = await testMySqlConnection(myToTest);
      return NextResponse.json({ success: testResult.success, result: testResult });
    }

    if (action === 'init-mysql-schema') {
      const currentConfig = getDbConfig();
      const myToInit = payload || currentConfig.mysql;
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
