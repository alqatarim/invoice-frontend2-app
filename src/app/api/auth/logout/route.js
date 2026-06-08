import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { clearAuthCookies } from '@/Auth/serverAuth'

const getSafeRedirectPath = value => {
  if (!value || typeof value !== 'string') return '/login'
  if (!value.startsWith('/') || value.startsWith('//')) return '/login'

  return value
}

export async function GET(request) {
  clearAuthCookies(cookies())

  const redirectPath = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'))

  return NextResponse.redirect(new URL(redirectPath, request.url))
}
