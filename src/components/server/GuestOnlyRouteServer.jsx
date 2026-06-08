import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_SESSION_COOKIE_KEY, AUTH_TOKEN_COOKIE_KEY } from '@/Auth/authConstants'
import { getTokenFromCookies, isAuthTokenExpired } from '@/Auth/serverAuth'

export default function GuestOnlyRouteServer({ children }) {
  const token = getTokenFromCookies()

  if (token && isAuthTokenExpired(token)) {
    cookies().delete(AUTH_TOKEN_COOKIE_KEY)
    cookies().delete(AUTH_SESSION_COOKIE_KEY)
  } else if (token) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
