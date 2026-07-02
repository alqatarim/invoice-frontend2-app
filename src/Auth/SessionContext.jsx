'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { getAuthSessionSnapshot } from '@/Auth/authActions'
import { clearAuthSession, getStoredSession, setAuthSession, signOutAndRedirect } from '@/Auth/session'
import { isTokenExpired } from '@/Auth/jwt'
import { buildSessionUser } from '@/Auth/sessionUser'
import { sessionConfig } from '@/data/dataSets'

const isGuestAuthRoute = () => {
  if (typeof window === 'undefined') return false

  const { pathname } = window.location

  return pathname === '/login' || pathname.endsWith('/login')
}

const SessionContext = createContext({
  data: null,
  status: 'loading',
  refreshSession: () => {},
})

const readCurrentSession = () => {
  const storedSession = getStoredSession()
  const token = storedSession?.token

  if (!token) return null

  if (isTokenExpired(token)) {
    void clearAuthSession()
    return null
  }

  return {
    user: {
      ...buildSessionUser(storedSession.user || {}),
      token,
    },
  }
}

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')

  const refreshSession = useCallback(() => {
    const nextSession = readCurrentSession()
    setSession(nextSession)
    setStatus(nextSession ? 'authenticated' : 'unauthenticated')
  }, [])

  useEffect(() => {
    const bootstrapSession = async () => {
      let storedSession = getStoredSession()

      if (storedSession?.token && isTokenExpired(storedSession.token)) {
        clearAuthSession()
        storedSession = null
      }

      if (storedSession?.token) {
        refreshSession()
        return
      }

      if (!isGuestAuthRoute()) {
        try {
          const snapshot = await getAuthSessionSnapshot()

          if (snapshot.success && snapshot.session?.token) {
            setAuthSession(snapshot.session)
            return
          }
        } catch {
          // Ignore snapshot failures and fall back to unauthenticated state.
        }
      }

      refreshSession()
    }

    void bootstrapSession()

    window.addEventListener('auth-session-updated', refreshSession)
    window.addEventListener('storage', refreshSession)

    return () => {
      window.removeEventListener('auth-session-updated', refreshSession)
      window.removeEventListener('storage', refreshSession)
    }
  }, [refreshSession])

  const contextValue = useMemo(
    () => ({
      data: session,
      status,
      refreshSession,
    }),
    [refreshSession, session, status]
  )

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)

export const signOut = ({ callbackUrl = '/login' } = {}) => {
  signOutAndRedirect(callbackUrl)
}

export const SessionExpiryWatcher = () => {
  const { data: session, status } = useSession()
  const signOutTriggered = useRef(false)

  useEffect(() => {
    signOutTriggered.current = false

    if (status === 'loading') return

    const token = session?.user?.token
    if (!token) return

    const checkExpiry = () => {
      if (signOutTriggered.current) return

      if (isTokenExpired(token)) {
        signOutTriggered.current = true
        signOut({ callbackUrl: '/login?expired=true' })
      }
    }

    checkExpiry()

    const interval = setInterval(checkExpiry, sessionConfig.checkIntervals.frequent)

    return () => clearInterval(interval)
  }, [session?.user?.token, status])

  return null
}