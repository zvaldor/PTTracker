export interface User {
  id: string;
  email: string;
  passwordHash?: string | null;
  locale: 'en' | 'ru';
  themePreference: 'system' | 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  locale?: 'en' | 'ru';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface MagicLinkDto {
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
