import mysql, { Pool } from 'mysql2/promise';
import { MySqlConfig, DbConnectionTestResult } from '@/types/database';
import { getDbConfig } from './dbConfig';

let pool: Pool | null = null;
let currentConfigString = '';

export function getMySqlPool(configOverride?: MySqlConfig): Pool | null {
  const cfg = configOverride || getDbConfig().mysql;
  if (!cfg || !cfg.host || !cfg.database) return null;

  const key = `${cfg.host}:${cfg.port}:${cfg.database}:${cfg.user}:${cfg.ssl}`;

  if (pool && currentConfigString === key) {
    return pool;
  }

  try {
    currentConfigString = key;
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    return pool;
  } catch (err) {
    console.error('Error creating MySQL pool:', err);
    return null;
  }
}

/** Uji koneksi MySQL */
export async function testMySqlConnection(config: MySqlConfig): Promise<DbConnectionTestResult> {
  const startTime = Date.now();
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 5000,
    });

    const [rows]: [any[], any] = await conn.query('SELECT VERSION() as version, DATABASE() as db');
    const latency = Date.now() - startTime;
    const version = rows[0]?.version || 'Unknown';
    const dbName = rows[0]?.db || config.database;

    // Cek tabel yang sudah ada
    const [tables]: [any[], any] = await conn.query('SHOW TABLES');
    const tableNames = tables.map((t: any) => Object.values(t)[0] as string);

    await conn.end();

    return {
      success: true,
      message: `Koneksi MySQL Sukses! Terhubung ke server MySQL v${version} (database: ${dbName}) dalam ${latency}ms.`,
      details: {
        latencyMs: latency,
        version,
        database: dbName,
        host: config.host,
        detectedTables: tableNames,
      },
    };
  } catch (err: any) {
    if (conn) {
      try {
        await conn.end();
      } catch {}
    }
    return {
      success: false,
      message: `Koneksi MySQL Gagal: ${err.message || String(err)}`,
      error: err.code || err.message,
    };
  }
}

/** Inisialisasi Skema Tabel MySQL Otomatis */
export async function initMySqlSchema(config: MySqlConfig): Promise<{ success: boolean; message: string; tablesCreated?: string[] }> {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 7000,
    });

    const tablesToCreate = [
      {
        name: 'bookings',
        sql: `CREATE TABLE IF NOT EXISTS bookings (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      },
      {
        name: 'gallery_items',
        sql: `CREATE TABLE IF NOT EXISTS gallery_items (
          id VARCHAR(100) PRIMARY KEY,
          type VARCHAR(50) NOT NULL DEFAULT 'PHOTO',
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'JEEP ACTION',
          media_url TEXT NOT NULL,
          instagram_url TEXT,
          thumbnail_url TEXT,
          caption TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      },
      {
        name: 'hero_slides',
        sql: `CREATE TABLE IF NOT EXISTS hero_slides (
          id VARCHAR(100) PRIMARY KEY,
          image_url TEXT NOT NULL,
          title VARCHAR(255) NOT NULL DEFAULT '',
          show_text BOOLEAN NOT NULL DEFAULT TRUE,
          headline VARCHAR(255),
          subheadline VARCHAR(255),
          show_button BOOLEAN NOT NULL DEFAULT TRUE,
          order_index INT NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      },
      {
        name: 'tour_packages',
        sql: `CREATE TABLE IF NOT EXISTS tour_packages (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      },
      {
        name: 'collage_content',
        sql: `CREATE TABLE IF NOT EXISTS collage_content (
          id VARCHAR(50) PRIMARY KEY,
          headline VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          image1 TEXT NOT NULL,
          image1_caption VARCHAR(255),
          image2 TEXT NOT NULL,
          image2_caption VARCHAR(255),
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      },
    ];

    for (const item of tablesToCreate) {
      await conn.query(item.sql);
    }

    await conn.end();

    return {
      success: true,
      message: `Semua 5 tabel MySQL berhasil diinisialisasi: bookings, gallery_items, hero_slides, tour_packages, collage_content.`,
      tablesCreated: tablesToCreate.map((t) => t.name),
    };
  } catch (err: any) {
    if (conn) {
      try {
        await conn.end();
      } catch {}
    }
    return {
      success: false,
      message: `Gagal inisialisasi tabel MySQL: ${err.message || String(err)}`,
    };
  }
}
