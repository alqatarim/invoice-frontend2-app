'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ProtectedComponent = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined' || status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return <p>Loading...</p>
  }

  return children
}

export default ProtectedComponent
