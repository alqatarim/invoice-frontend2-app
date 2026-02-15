const decodeJwtPayload = token => {
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
  } catch (error) {
    return null
  }
}

export const isTokenExpired = token => {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true

  const currentUnixTime = Date.now() / 1000
  return payload.exp <= currentUnixTime
}
