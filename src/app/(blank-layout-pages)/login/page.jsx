import LoginIndex from '@/views/authentication/login'
import GuestOnlyRouteServer from '@/components/server/GuestOnlyRouteServer'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getServerMode } from '@core/utils/serverHelpers'

const buildQueryString = searchParams => {
  const params = new URLSearchParams()

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, item))
      return
    }

    if (value !== undefined) {
      params.set(key, value)
    }
  })

  const queryString = params.toString()

  return queryString ? `?${queryString}` : ''
}

const redirectToCanonicalLoginHost = searchParams => {
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!frontendUrl) {
    return
  }

  const canonicalUrl = new URL(frontendUrl)
  const requestHeaders = headers()
  const requestHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')

  if (!requestHost || requestHost.toLowerCase() === canonicalUrl.host.toLowerCase()) {
    return
  }

  redirect(`${canonicalUrl.origin}/login${buildQueryString(searchParams)}`)
}

const LoginPage = ({ searchParams }) => {
  redirectToCanonicalLoginHost(searchParams)

  // Vars
  const mode = getServerMode()

  return (
    <GuestOnlyRouteServer>
      <LoginIndex initialMode={mode} />
    </GuestOnlyRouteServer>
  )
}

export default LoginPage
