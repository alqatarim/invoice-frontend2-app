import 'server-only'

import { cookies } from 'next/headers'

import { AUTH_SESSION_COOKIE_KEY, AUTH_TOKEN_COOKIE_KEY } from '@/Auth/authConstants'
import { isTokenExpired } from '@/Auth/jwt'
import { buildSessionUser } from '@/Auth/sessionUser'

export const getTokenFromCookies = () => {
  return cookies().get(AUTH_TOKEN_COOKIE_KEY)?.value || ''
}

export const isAuthTokenExpired = token => isTokenExpired(token)

export const getServerSessionUser = () => {
  const token = getTokenFromCookies()
  if (!token || isAuthTokenExpired(token)) return null

  const rawSession = cookies().get(AUTH_SESSION_COOKIE_KEY)?.value || ''
  if (!rawSession) return { token }

  try {
    const user = JSON.parse(rawSession)
    return { ...buildSessionUser(user), token }
  } catch {
    return { token }
  }
}

export const isServerAuthenticated = () => {
  const token = getTokenFromCookies()
  return Boolean(token) && !isAuthTokenExpired(token)
}

export const getHomeRedirect = () => {
  return isServerAuthenticated() ? '/dashboard' : '/login'
}

const expiredCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 0,
}

export const clearAuthCookies = cookieStore => {
  cookieStore.set(AUTH_TOKEN_COOKIE_KEY, '', expiredCookieOptions)
  cookieStore.set(AUTH_SESSION_COOKIE_KEY, '', expiredCookieOptions)
  cookieStore.delete(AUTH_TOKEN_COOKIE_KEY)
  cookieStore.delete(AUTH_SESSION_COOKIE_KEY)
}
