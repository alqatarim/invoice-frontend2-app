import { clearAuthCookie } from '@/Auth/authActions'
import { AUTH_SESSION_COOKIE_KEY, AUTH_STORAGE_KEY, AUTH_TOKEN_COOKIE_KEY } from '@/Auth/authConstants'
import { buildAuthSession, buildSessionUser } from '@/Auth/sessionUser'

const isBrowser = () => typeof window !== 'undefined'

const clearLegacyClientCookie = key => {
  document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

export const normalizeAuthUser = buildSessionUser
export const normalizeAuthSession = buildAuthSession

export const getStoredSession = () => {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setAuthSession = session => {
  if (!isBrowser()) return

  const normalizedSession = {
    token: session?.token || '',
    user: buildSessionUser(session?.user || {}),
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedSession))
  window.dispatchEvent(new CustomEvent('auth-session-updated'))
}

export const clearAuthSession = ({ skipEvent = false } = {}) => {
  if (!isBrowser()) return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  clearLegacyClientCookie(AUTH_TOKEN_COOKIE_KEY)
  clearLegacyClientCookie(AUTH_SESSION_COOKIE_KEY)
  void clearAuthCookie()

  if (!skipEvent) {
    window.dispatchEvent(new CustomEvent('auth-session-updated'))
  }
}

export const signOutAndRedirect = (callbackUrl = '/login') => {
  if (!isBrowser()) return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  clearLegacyClientCookie(AUTH_TOKEN_COOKIE_KEY)
  clearLegacyClientCookie(AUTH_SESSION_COOKIE_KEY)

  const redirect = encodeURIComponent(callbackUrl)
  window.location.assign(`/api/auth/logout?redirect=${redirect}`)
}
