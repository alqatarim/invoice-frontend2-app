'use server'

import { cookies } from 'next/headers'

import { AUTH_SESSION_COOKIE_KEY, AUTH_TOKEN_COOKIE_KEY } from '@/Auth/authConstants'
import { getTokenMaxAge, isTokenExpired } from '@/Auth/jwt'
import { clearAuthCookies } from '@/Auth/serverAuth'
import { buildSessionUser } from '@/Auth/sessionUser'

const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24

const getCookieOptions = token => {
  const tokenMaxAge = getTokenMaxAge(token)

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: tokenMaxAge ?? DEFAULT_SESSION_MAX_AGE,
  }
}

export async function persistAuthCookie(token, user) {
  if (!token || isTokenExpired(token)) {
    return {
      success: false,
      message: 'Invalid or expired auth session token.',
    }
  }

  const cookieOptions = getCookieOptions(token)
  const serverSessionUser = buildSessionUser(user)

  cookies().set(AUTH_TOKEN_COOKIE_KEY, token, cookieOptions)
  cookies().set(AUTH_SESSION_COOKIE_KEY, JSON.stringify(serverSessionUser), cookieOptions)

  return { success: true }
}

export async function clearAuthCookie() {
  clearAuthCookies(cookies())
  return { success: true }
}

export async function getAuthSessionSnapshot() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_KEY)?.value || ''

  if (!token || isTokenExpired(token)) {
    return { success: false, session: null }
  }

  const rawSession = cookieStore.get(AUTH_SESSION_COOKIE_KEY)?.value || ''
  let user = {}

  try {
    user = rawSession ? JSON.parse(rawSession) : {}
  } catch {
    user = {}
  }

  return {
    success: true,
    session: {
      token,
      user: {
        ...buildSessionUser(user),
        token,
      },
    },
  }
}
