import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '@/config/env';

/**
 * Hashes a plain-text password using bcrypt.
 * @param password - The plain-text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.BCRYPT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored hash.
 * @param password - The plain-text password to check
 * @param hash - The stored bcrypt hash
 * @returns True if the password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically secure random token for password reset.
 * @returns A 64-character hex token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a cryptographically secure random token for email verification.
 * @returns A 64-character hex token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates a password against strength requirements.
 * Must be at least 8 chars, contain uppercase, lowercase, number, and special char.
 * @param password - Password to validate
 * @returns Object with isValid boolean and message string
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true, message: 'Password is strong' };
}

/**
 * Generates a random numeric OTP of given length.
 * @param length - Number of digits (default 6)
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
