// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Auth Imports
import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

const GuestOnlyRoute = async ({ children }) => {
  let session = null

  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Failed to read guest route session:', error)
  }

  const token = session?.user?.token

  if (token && !isTokenExpired(token)) {
    redirect('/dashboard')
  }

  return <>{children}</>
}

export default GuestOnlyRoute
