'use client'

import { useSession } from 'next-auth/react'
import AuthRedirect from '@/components/AuthRedirect'

const AuthWrapper = ({ children }) => {
  const { data: session, status } = useSession()



  if (!session) {
    return <AuthRedirect />
  }

  return children
}

export default AuthWrapper
