export const decodeJwtPayload = token => {
  if (!token || typeof token !== 'string') return null

  const tokenParts = token.split('.')
  if (tokenParts.length < 2) return null

  try {
    const base64Url = tokenParts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    if (typeof window === 'undefined') {
      return JSON.parse(Buffer.from(paddedBase64, 'base64').toString('utf8'))
    }

    return JSON.parse(atob(paddedBase64))
  } catch {
    return null
  }
}

export const getTokenExpiry = token => {
  const payload = decodeJwtPayload(token)
  return Number.isFinite(payload?.exp) ? payload.exp : null
}

export const getTokenMaxAge = token => {
  const expiry = getTokenExpiry(token)
  if (expiry === null) return null

  const secondsUntilExpiry = Math.floor(expiry - Date.now() / 1000)
  return secondsUntilExpiry > 0 ? secondsUntilExpiry : 0
}

export const getSecondsUntilExpiry = token => {
  const expiry = getTokenExpiry(token)
  if (expiry === null) return null

  return expiry - Date.now() / 1000
}

export const isTokenExpired = token => {
  const expiry = getTokenExpiry(token)
  if (expiry === null) return true

  return expiry <= Date.now() / 1000
}

export const formatTimeRemaining = token => {
  if (!token) return null

  const secondsUntilExpiry = getSecondsUntilExpiry(token)
  if (secondsUntilExpiry === null) return 'Invalid Token'
  if (secondsUntilExpiry <= 0) return 'Expired'

  const hours = Math.floor(secondsUntilExpiry / 3600)
  const minutes = Math.floor((secondsUntilExpiry % 3600) / 60)
  const seconds = Math.floor(secondsUntilExpiry % 60)

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}
