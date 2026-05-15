import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

const RootPage = async () => {
  let session = null

  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Failed to read root page session:', error)
  }

  const token = session?.user?.token

  if (token && !isTokenExpired(token)) {
    redirect('/dashboard')
  }

  redirect('/login')
}

export default RootPage
