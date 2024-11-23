'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const useAuthRedirect = () => {
  const router = useRouter()
  const { status } = useSession()

  const handleAuthError = (response, returnPath) => {
    if (response?.success === false) {
      const redirectPath = returnPath || window.location.pathname
      router.push(`/login?redirect=${redirectPath}`)

      return {
        isAuthError: true,
        snackbarData: {
          open: true,
          message: response.message || 'Authentication required',
          status: 'error'
        }
      }
    }

    return { isAuthError: false }
  }

  return { handleAuthError, isLoading: status === 'loading' }
}

export default useAuthRedirect