import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { clearAuthCookies, getTokenFromCookies, isAuthTokenExpired } from '@/Auth/serverAuth'

export default function GuestOnlyRouteServer({ children }) {
  const token = getTokenFromCookies()

  if (token && isAuthTokenExpired(token)) {
    clearAuthCookies(cookies())
  } else if (token) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
