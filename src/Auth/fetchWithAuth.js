import "server-only";

import { getTokenFromCookies } from "@/Auth/serverAuth";
import { isTokenExpired } from "@/Auth/jwt";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchWithAuth(endpoint, options = {}) {
  const token = getTokenFromCookies();

  if (!token) {
    return { error: "No authentication session found" };
  }

  if (isTokenExpired(token)) {
    return { error: "Session expired. Please log in again." };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    token,
    ...options.headers,
  };

  try {
    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    let body = null;

    try {
      body = await response.clone().json();
    } catch {
      body = null;
    }

    if (response.ok) {
      return body ?? response.json();
    }

    if (response.status === 401) {
      throw new Error(body?.message || "Unauthorized access - please log in again");
    }

    if (response.status === 403) {
      const message = body?.data?.message;
      throw new Error(Array.isArray(message) ? message.join(", ") : message || "Forbidden");
    }

    if (response.status === 500) {
      throw new Error("Internal server error - please try again later");
    }

    const message = body?.message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || "An unknown error occurred");
  } catch (error) {
    console.error("Error in fetchWithAuth:", error.message);
    throw error;
  }
}
