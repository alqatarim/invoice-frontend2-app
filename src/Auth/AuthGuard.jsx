// Third-party Imports
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

// Auth Imports
import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

export default async function AuthGuard({ children }) {
  const session = await getServerSession(authOptions)
  const token = session?.user?.token

  if (!token) {
    redirect('/login')
  }

  if (isTokenExpired(token)) {
    redirect('/login?expired=true')
  }

  return <>{children}</>
}
