export type UserRole = 'SUPERUSER' | 'ADMIN';

export interface AdminAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string; // or plain for simple file store
  password?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface ClientAdminSession {
  id?: string;
  username: string;
  name?: string;
  email: string;
  role: UserRole;
  token?: string;
  loginTime?: string;
}
