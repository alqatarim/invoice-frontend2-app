// Third-party Imports
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

// Auth Imports
import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

export default async function AuthGuard({ children }) {
  let session = null

  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Failed to read protected route session:', error)
  }

  const token = session?.user?.token

  if (!token) {
    redirect('/login')
  }

  if (isTokenExpired(token)) {
    redirect('/login?expired=true')
  }

  return <>{children}</>
}
