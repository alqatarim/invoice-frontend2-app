// Single source of truth for JWT decoding helpers used across the auth surface.
// Keeps callers free of repeated atob/Buffer base64 logic and avoids subtle
// drift between the watcher, countdown, status indicator, and fetch layer.

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

  try {
    if (typeof window === 'undefined') {
      return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    }

    return JSON.parse(atob(padded));
  } catch (_error) {
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const payload = decodeJwtPayload(token);
  return Number.isFinite(payload?.exp) ? payload.exp : null;
};

export const getSecondsUntilExpiry = (token) => {
  const exp = getTokenExpiry(token);
  if (exp === null) return null;
  return exp - Date.now() / 1000;
};

export const isTokenExpired = (token) => {
  const exp = getTokenExpiry(token);
  if (exp === null) return true;
  return exp <= Date.now() / 1000;
};

// Format a remaining-seconds value as `Hh Mm Ss` / `Mm Ss` / `Ss`.
// Returns null when there is no token, "Expired" when expired, or
// "Invalid Token" when decoding fails.
export const formatTimeRemaining = (token) => {
  if (!token) return null;

  const exp = getTokenExpiry(token);
  if (exp === null) return 'Invalid Token';

  const seconds = exp - Date.now() / 1000;
  if (seconds <= 0) return 'Expired';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
