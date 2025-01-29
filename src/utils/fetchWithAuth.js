// '@/utils/fetchWithAuth.js'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth';


   const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Add session caching
let cachedSession = null;
let sessionExpiry = null;
const SESSION_CACHE_DURATION = 30 * 1000; // 30 seconds

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
    cachedSession = await getServerSession(authOptions);
    sessionExpiry = Date.now() + SESSION_CACHE_DURATION;
  }

  if (!cachedSession) {
    return { error: 'No authentication session found' };
  }

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
