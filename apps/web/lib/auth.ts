const TOKEN_KEY = 'budget_token';
const REFRESH_TOKEN_KEY = 'budget_refresh_token';
const USER_KEY = 'budget_user';

// ========================================
// TOKEN HELPERS
// ========================================
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setToken = (token: string, refreshToken?: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token, 7);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie(TOKEN_KEY);
};

// ========================================
// USER HELPERS
// ========================================
export const getUser = <T = unknown>(): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: unknown): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

// ========================================
// AUTH STATE
// ========================================
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = parseJwt(token);
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 > Date.now();
    }
    return !!token;
  } catch {
    return !!token;
  }
};

// ========================================
// COOKIE HELPERS
// ========================================
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict; Secure`;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ========================================
// JWT HELPERS
// ========================================
export const parseJwt = (token: string): Record<string, unknown> => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const payload = parseJwt(token);
    if (payload.exp) {
      return new Date((payload.exp as number) * 1000);
    }
    return null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return expiry.getTime() < Date.now();
};
