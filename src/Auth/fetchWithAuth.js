import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/Auth/auth';
import { isTokenExpired } from '@/Auth/tokenUtils';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Token-keyed session cache. Keeps `getServerSession()` cheap for bursts of
// server actions while preventing cross-user reads (each entry is keyed by a
// hash of the access token rather than a single global slot).
const SESSION_CACHE_TTL_MS = 30 * 1000;
const sessionCache = new Map();

const hashToken = (token) => {
  if (!token) return '';
  // Stable, non-cryptographic key: token length + first/last 8 chars.
  // Enough to uniquely identify a session within a process without storing
  // the raw token as a Map key.
  return `${token.length}:${token.slice(0, 8)}:${token.slice(-8)}`;
};

const readSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error reading server session:', error);
    return null;
  }
};

const refreshTokenIfNeeded = async (session) => {
  const token = session?.user?.token;
  if (!token || !isTokenExpired(token)) return session;

  try {
    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return session;

    const data = await response.json();

    if (data.status === 'Success' && data.data?.token) {
      session.user.token = data.data.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return session;
};

const getCachedSession = async () => {
  const session = await readSession();
  if (!session?.user?.token) return session;

  const key = hashToken(session.user.token);
  const cached = sessionCache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.session;
  }

  const refreshed = await refreshTokenIfNeeded(session);
  const refreshedKey = hashToken(refreshed?.user?.token);

  sessionCache.set(refreshedKey, {
    session: refreshed,
    expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
  });

  return refreshed;
};

const invalidateSessionByToken = (token) => {
  const key = hashToken(token);
  if (key) sessionCache.delete(key);
};

const isDev = process.env.NODE_ENV === 'development';

const generateRequestId = () => Math.random().toString(36).slice(2, 9);

const summarizeRequestBody = (body) => {
  if (body === undefined) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (_error) {
      return body;
    }
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return { formData: Object.fromEntries(body.entries()) };
  }
  return body;
};

export async function fetchWithAuth(endpoint, options = {}) {
  const session = await getCachedSession();

  if (!session?.user?.token) {
    return { error: 'No authentication session found' };
  }

  const headers = {
    Authorization: `Bearer ${session.user.token}`,
    token: session.user.token,
    ...options.headers,
  };

  const requestId = generateRequestId();

  if (isDev) {
    console.log(`=== Request to ${endpoint} [${requestId}] ===`, {
      requestId,
      endpoint,
      method: options.method || 'GET',
      body: summarizeRequestBody(options.body),
    });
  }

  let response;

  try {
    response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    console.error(`fetchWithAuth network error [${requestId}] ${endpoint}:`, error.message);
    throw error;
  }

  let body = null;
  try {
    body = await response.clone().json();
  } catch (_error) {
    // Non-JSON response - body stays null.
  }

  if (isDev) {
    console.log(`=== Response from ${endpoint} [${requestId}] ${response.status} ===`, {
      requestId,
      status: response.status,
      data: body,
    });
  }

  if (response.ok) {
    return body ?? response.json();
  }

  if (response.status === 401) {
    invalidateSessionByToken(session.user.token);
    throw new Error(body?.message || 'Unauthorized access - please log in again');
  }

  if (response.status === 403) {
    const message = body?.data?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Forbidden');
  }

  if (response.status === 500) {
    throw new Error('Internal server error - please try again later');
  }

  const message = body?.message;
  throw new Error(
    Array.isArray(message) ? message.join(', ') : message || 'An unknown error occurred'
  );
}
