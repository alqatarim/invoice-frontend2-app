// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Auth Imports
import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

const GuestOnlyRoute = async ({ children }) => {
  const session = await getServerSession(authOptions)
  const token = session?.user?.token

  if (token && !isTokenExpired(token)) {
    redirect('/dashboard')
  }

  return <>{children}</>
}

export default GuestOnlyRoute
