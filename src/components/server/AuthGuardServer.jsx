import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { clearAuthCookies, getTokenFromCookies, isAuthTokenExpired } from '@/Auth/serverAuth'

export default function AuthGuardServer({ children }) {
  const token = getTokenFromCookies()

  if (!token) {
    redirect('/login')
  }

  if (isAuthTokenExpired(token)) {
    clearAuthCookies(cookies())
    redirect('/login?expired=true')
  }

  return <>{children}</>
}
