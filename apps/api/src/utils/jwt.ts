import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '@/config/env';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface DecodedToken extends JwtPayload, TokenPayload {}
export interface DecodedRefreshToken extends JwtPayload, RefreshTokenPayload {}

// ─────────────────────────────────────────────
// Access Token
// ─────────────────────────────────────────────

/**
 * Generates a signed JWT access token for the given payload.
 * @param payload - User identification data to embed in the token
 * @returns Signed JWT string
 */
export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as any,
    issuer: 'budget-planner',
    audience: 'budget-planner-client',
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT access token.
 * @param token - JWT string to verify
 * @returns Decoded payload if valid
 * @throws JsonWebTokenError or TokenExpiredError
 */
export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, config.JWT_SECRET, {
    issuer: 'budget-planner',
    audience: 'budget-planner-client',
  }) as DecodedToken;
}

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────

/**
 * Generates a signed JWT refresh token.
 * @param payload - Minimal payload (userId + unique tokenId)
 * @returns Signed JWT refresh token string
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN as any,
    issuer: 'budget-planner',
    audience: 'budget-planner-refresh',
  };
  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, options);
}

/**
 * Verifies and decodes a JWT refresh token.
 * @param token - Refresh token string to verify
 * @returns Decoded payload if valid
 * @throws JsonWebTokenError or TokenExpiredError
 */
export function verifyRefreshToken(token: string): DecodedRefreshToken {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET, {
    issuer: 'budget-planner',
    audience: 'budget-planner-refresh',
  }) as DecodedRefreshToken;
}

/**
 * Extracts the token from a Bearer authorization header string.
 * @param authHeader - Authorization header value
 * @returns Raw token string or null
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
}

/**
 * Returns the expiry timestamp (in seconds since epoch) for a given duration string.
 * @param expiresIn - Duration string like '7d', '15m'
 */
export function getExpiryDate(expiresIn: string): Date {
  const now = Math.floor(Date.now() / 1000);
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  const expiryTimestamp = (now + value * multipliers[unit]) * 1000;
  return new Date(expiryTimestamp);
}
