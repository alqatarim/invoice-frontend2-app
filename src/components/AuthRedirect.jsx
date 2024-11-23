'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

const AuthRedirect = ({ lang }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [navigateTo, setNavigateTo] = useState(null)

  useEffect(() => {
    const homePage = '/dashboard'
    const loginPage = '/login'

    console.log('AuthRedirect: session', session)
    console.log('AuthRedirect: status', status)
    console.log('AuthRedirect: pathname', pathname)

    if (status === 'loading') return // Do nothing while loading

    // Redirect to login if no session is found
    if (!session && pathname !== loginPage) {
      setNavigateTo(loginPage)
    } else if (session && pathname === '/') {
      setNavigateTo(homePage)
    }
  }, [session, status, pathname])

  useEffect(() => {
    if (navigateTo) {
      router.push(navigateTo)
      setNavigateTo(null)
    }
  }, [navigateTo, router])

  useEffect(() => {
    // Force a re-render after navigation is complete
    router.refresh()
  }, [pathname, router])

  return null
}

export default AuthRedirect
