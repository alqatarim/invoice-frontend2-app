'use client'

import { useSession } from 'next-auth/react'
import AuthRedirect from '@/components/AuthRedirect'

const AuthWrapper = ({ children }) => {
  const { data: session, status } = useSession()

  console.log('AuthWrapper: session', session)
  console.log('AuthWrapper: status', status)

  if (status === 'loading') {
    return <p>Loading...</p> // or a loading spinner
  }

  if (!session) {
    return <AuthRedirect />
  }

  return children
}

export default AuthWrapper
