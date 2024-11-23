// '@/utils/fetchWithAuth.js'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth';
import fs from 'fs';
import path from 'path';

   const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchWithAuth(endpoint, options = {}) {
  const session = await getServerSession(authOptions);



  if (!session) {

    return { error: 'No authentication session found' };
  } else {
    const headers = {
      'Authorization': `Bearer ${session.user.token}`,
      'token': session.user.token,
      ...options.headers,
    };

    try {
    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });






     // Clone response for logging
    const responseClone = response.clone();

    // Get response text first
    const responseText = await responseClone.text();
    let responseData;

    try {
      // Try to parse as JSON
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      request: {
        method: options.method || 'GET',
        body: options.body,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      }
    };

    // Log via API route instead of direct file system access
    try {
      await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });

      console.log('API Log saved:', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        data: responseData.data
      });
    } catch (logError) {
      console.error('Error saving API log:', logError);
    }

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
    throw error;
  }

  }
}
