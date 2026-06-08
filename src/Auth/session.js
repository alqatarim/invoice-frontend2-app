import { clearAuthCookie } from '@/Auth/authActions'
import { AUTH_SESSION_COOKIE_KEY, AUTH_STORAGE_KEY, AUTH_TOKEN_COOKIE_KEY } from '@/Auth/authConstants'

const isBrowser = () => typeof window !== 'undefined'

const clearLegacyClientCookie = key => {
  document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

export const normalizeAuthUser = (authData = {}, fallbackEmail = '') => {
  const profileDetails = authData.profileDetails || {}
  const firstName = profileDetails.firstName || ''
  const lastName = profileDetails.lastName || ''
  const name = `${firstName} ${lastName}`.trim() || fallbackEmail || authData.email || 'User'

  return {
    id: authData.id || profileDetails.id || '',
    email: authData.email || fallbackEmail || '',
    name,
    image: profileDetails.image || '',
    firstName,
    lastName,
    gender: profileDetails.gender || '',
    role: authData.role || '',
    authProvider: authData.authProvider || 'credentials',
    hasPassword: Boolean(authData.hasPassword),
    permissionRes: authData.permissionRes || null,
    companyDetails: authData.companyDetails || null,
    companyMembership: authData.companyMembership || null,
    accessibleBranches: authData.accessibleBranches || [],
    currencySymbol: authData.currencySymbol || '',
    token: authData.token || '',
  }
}

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

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session || {}))
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
