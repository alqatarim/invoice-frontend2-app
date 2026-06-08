const isInternalHost = host => {
  if (!host) return true

  const normalized = host.toLowerCase()

  return (
    normalized.startsWith('0.0.0.0') ||
    normalized.startsWith('127.0.0.1') ||
    normalized.startsWith('localhost')
  )
}

export const getPublicAppOrigin = request => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin
    } catch {
      // fall through
    }
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost?.split(',')[0]?.trim() || request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const protocol = forwardedProto || request.nextUrl.protocol.replace(':', '')

  if (host && !isInternalHost(host)) {
    return `${protocol}://${host}`
  }

  return request.nextUrl.origin
}
