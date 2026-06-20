import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Retrieve a required environment variable. Throws if missing.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Retrieve an optional environment variable with a fallback default.
 */
function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function optionalEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
  }
  return parsed;
}

// ─────────────────────────────────────────────
// Exported Config Object
// ─────────────────────────────────────────────

export const config = {
  // Server
  PORT: optionalEnvNumber('PORT', 5000),
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // JWT
  JWT_SECRET: optionalEnv('JWT_SECRET', 'super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET: optionalEnv('REFRESH_TOKEN_SECRET', 'super-secret-refresh-key-change-in-production'),
  REFRESH_TOKEN_EXPIRES_IN: optionalEnv('REFRESH_TOKEN_EXPIRES_IN', '7d'),

  // SMTP / Email
  SMTP_HOST: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: optionalEnvNumber('SMTP_PORT', 587),
  SMTP_SECURE: optionalEnv('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: optionalEnv('SMTP_USER', ''),
  SMTP_PASS: optionalEnv('SMTP_PASS', ''),
  EMAIL_FROM: optionalEnv('EMAIL_FROM', 'noreply@budgetplanner.com'),
  EMAIL_FROM_NAME: optionalEnv('EMAIL_FROM_NAME', 'Budget Planner'),

  // File Upload
  UPLOAD_DIR: optionalEnv('UPLOAD_DIR', './uploads'),
  MAX_FILE_SIZE: optionalEnvNumber('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB

  // Security
  BCRYPT_ROUNDS: optionalEnvNumber('BCRYPT_ROUNDS', 12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: optionalEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: optionalEnvNumber('RATE_LIMIT_MAX', 100),
  AUTH_RATE_LIMIT_MAX: optionalEnvNumber('AUTH_RATE_LIMIT_MAX', 10),

  // URLs
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
  API_URL: optionalEnv('API_URL', 'http://localhost:5000'),

  // Admin Defaults
  ADMIN_EMAIL: optionalEnv('ADMIN_EMAIL', 'admin@budgetplanner.com'),
  ADMIN_PASSWORD: optionalEnv('ADMIN_PASSWORD', 'Admin@123456'),

  // External APIs
  EXCHANGE_RATE_API_KEY: optionalEnv('EXCHANGE_RATE_API_KEY', ''),
  EXCHANGE_RATE_API_URL: optionalEnv('EXCHANGE_RATE_API_URL', 'https://api.exchangerate-api.com/v4/latest'),

  // Web Push VAPID Keys
  VAPID_PUBLIC_KEY: optionalEnv('VAPID_PUBLIC_KEY', ''),
  VAPID_PRIVATE_KEY: optionalEnv('VAPID_PRIVATE_KEY', ''),
} as const;

export type Config = typeof config;

// Validate critical settings in production
if (config.NODE_ENV === 'production') {
  const warnings: string[] = [];

  if (config.JWT_SECRET === 'super-secret-jwt-key-change-in-production') {
    warnings.push('JWT_SECRET is using the default insecure value!');
  }
  if (config.REFRESH_TOKEN_SECRET === 'super-secret-refresh-key-change-in-production') {
    warnings.push('REFRESH_TOKEN_SECRET is using the default insecure value!');
  }
  if (!config.SMTP_USER) {
    warnings.push('SMTP_USER is not configured — emails will not be sent');
  }

  warnings.forEach((w) => console.warn(`[CONFIG WARNING] ${w}`));
}
