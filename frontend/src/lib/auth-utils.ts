// File: frontend/src/lib/auth-utils.ts (NEW FILE)
export const TOKEN_EXPIRY_SECONDS = 3600;        // 1 hour
export const REFRESH_EXPIRY_SECONDS = 604800;    // 7 days

export function storeAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  refreshExpiresIn: number
) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenExpiry', String(Date.now() + (expiresIn * 1000)));
  localStorage.setItem('refreshExpiry', String(Date.now() + (refreshExpiresIn * 1000)));
}

export function isAccessTokenValid(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('authToken');
  const expiry = localStorage.getItem('tokenExpiry');
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

export async function refreshAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshExpiry = localStorage.getItem('refreshExpiry');

  if (!refreshToken || !refreshExpiry) return null;
  if (Date.now() >= parseInt(refreshExpiry, 10)) return null;

  try {
    // Use the correct API URL and versioned endpoint
    const API_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:8000';

    const response = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })  // Backend expects 'refresh_token' field name
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);  // Backend returns 'access_token' field
    localStorage.setItem('tokenExpiry', String(Date.now() + (data.expires_in * 1000)));  // Backend returns 'expires_in'

    return data.access_token;  // Backend returns 'access_token' field
  } catch (error) {
    clearAuthTokens();
    return null;
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('refreshExpiry');
}