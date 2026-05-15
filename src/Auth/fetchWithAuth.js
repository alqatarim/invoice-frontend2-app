// '@/utils/fetchWithAuth.js'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/Auth/auth';


const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Utility function to check if JWT token is expired
function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true;
  }
}

// Function to refresh JWT token if needed
async function refreshTokenIfNeeded(session) {
  if (!session?.user?.token) return session;

  if (isTokenExpired(session.user.token)) {
    console.log('Token appears to be expired, attempting refresh...');

    try {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'Success' && data.data?.token) {
          console.log('Token refreshed successfully');
          session.user.token = data.data.token;
          return session;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return session;
}

// Add session caching
let cachedSession = null;
let sessionExpiry = null;
const SESSION_CACHE_DURATION = 60 * 60 * 1000; // 1 hour (aligned with JWT strategy)

export async function fetchWithAuth(endpoint, options = {}) {
  // Generate unique request ID for correlation
  const requestId = Math.random().toString(36).substring(7);

  // Create log object to store request and response details
  const logData = {
    requestId,
    request: {
      endpoint,
      options: { ...options },
      body: options.body ? (
        typeof options.body === 'string' ? JSON.parse(options.body) :
          options.body instanceof FormData ? { formData: Object.fromEntries(options.body.entries()) } :
            { json: options.body }
      ) : undefined
    },
    response: null
  };



  // Use cached session if available and not expired
  if (!cachedSession || Date.now() > sessionExpiry) {
    try {
      cachedSession = await getServerSession(authOptions);
      sessionExpiry = Date.now() + SESSION_CACHE_DURATION;

      // If session refresh fails, try to get a fresh session without cache
      if (!cachedSession) {
        console.log('Session cache refresh failed, clearing cache and retrying...');
        cachedSession = null;
        sessionExpiry = null;

        // Clear any existing session and try again
        cachedSession = await getServerSession(authOptions);
        sessionExpiry = Date.now() + SESSION_CACHE_DURATION;
      }
    } catch (error) {
      console.error('Error refreshing session cache:', error);
      cachedSession = null;
      sessionExpiry = null;
      return { error: 'Session refresh failed' };
    }
  }

  if (!cachedSession) {
    return { error: 'No authentication session found' };
  }

  // Try to refresh token if expired
  cachedSession = await refreshTokenIfNeeded(cachedSession);

  const headers = {
    'Authorization': `Bearer ${cachedSession.user.token}`,
    'token': cachedSession.user.token,
    ...options.headers,
  };

  try {
    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Clone response for logging (since response can only be consumed once)
    const responseClone = response.clone();
    const responseData = await responseClone.json();

    //  console.log(`=== Request to ${endpoint} [${requestId}] ===`);

    //  ============         ===============
    //  ============         ===============
    //  console.log('Request Details:', JSON.stringify(logData.request, null, 2));


    console.log(`=== Response Data from ${endpoint} [${requestId}] ===`);

    //  ============         ===============
    //  ============         ===============
    console.log(JSON.stringify(responseData, null, 2));

    // Update log object with response
    logData.response = {
      status: response.status,
      data: responseData
    };

    if (!response.ok) {
      const error = await response.clone().json();

      if (response.status === 401) {
        // Clear session cache on 401 to force fresh session on next request
        cachedSession = null;
        sessionExpiry = null;
        throw new Error(error?.message || 'Unauthorized access - please log in again');
      } else if (response.status === 403) {
        let errRes = error?.data?.message;
        if (Array.isArray(errRes)) {
          throw new Error(errRes.join(', '));
        } else {
          throw new Error(errRes);
        }
      } else if (response.status === 500) {
        throw new Error('Internal server error - please try again later');
      } else {
        throw new Error(
          Array.isArray(error.message)
            ? error.message.join(', ')
            : error.message || 'An unknown error occurred'
        );
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchWithAuth:', error.message);
    // Update log object with error
    logData.response = {
      error: error.message
    };

    console.log(`=== fetchWithAuth Error [${requestId}] ===`);
    console.log(JSON.stringify(logData, null, 2));
    throw error;
  }


}
