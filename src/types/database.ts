export type DatabaseMode = 'supabase' | 'mysql' | 'local';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface MySqlConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface SystemDatabaseConfig {
  activeMode: DatabaseMode;
  supabase: SupabaseConfig;
  mysql: MySqlConfig;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DbConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    latencyMs?: number;
    version?: string;
    database?: string;
    host?: string;
    detectedTables?: string[];
  };
  error?: string;
}
