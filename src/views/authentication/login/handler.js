'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { passwordRegex, passwordValidMessage, emailRgx } from '../../../constants'
import { getLocalizedUrl } from '@/utils/i18n'
import { persistAuthCookie } from '@/Auth/authActions'
import { getStoredSession, normalizeAuthUser, setAuthSession } from '@/Auth/session'

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7005').replace(/\/+$/, '')

const schema = yup.object({
  email: yup.string().matches(emailRgx, 'Please Enter valid Email').required('Email is required').trim(),
  password: yup.string().matches(passwordRegex, passwordValidMessage).required('Password is Required').trim(),
}).required()

const toErrorMessage = (payload, fallback) => {
  const message = payload?.data?.message || payload?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

const loginWithCredentials = async payload => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  let body = null

  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok || body?.code !== 200) {
    throw new Error(toErrorMessage(body, `Request failed: ${response.status}`))
  }

  return body?.data
}

const getAuthErrorMessage = errorCode => {
  if (!errorCode) {
    return ''
  }

  return decodeURIComponent(errorCode)
}

export function useLoginHandler({ initialMode }) {
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', status: 'loading' })
  const [errorState, setErrorState] = useState(null)
  const [isLoginProcessing, setIsLoginProcessing] = useState(false)

  const resolveRedirectURL = useCallback(() => {
    const redirectURL = searchParams.get('redirectTo') ?? '/dashboard'
    return getLocalizedUrl(redirectURL, locale)
  }, [locale, searchParams])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: 'john.doe@example.com',
      password: 'Test@123'
    }
  })

  useEffect(() => {
    const expired = searchParams.get('expired')
    const authError = searchParams.get('error')

    if (expired === 'true') {
      const message = 'Your session expired. Please sign in again.'
      setErrorState(message)
      setSnackbar({ open: true, message, status: 'error' })
      setIsLoginProcessing(false)
      return
    }

    if (authError) {
      const message = getAuthErrorMessage(authError)
      setErrorState(message)
      setSnackbar({ open: true, message, status: 'error' })
      setIsLoginProcessing(false)
    }
  }, [searchParams])

  const handlePasswordToggle = () => {
    setIsPasswordShown(show => !show)
  }

  const navigateToRedirect = useCallback(async () => {
    const storedSession = getStoredSession()
    const token = storedSession?.token
    const user = storedSession?.user

    if (token && user) {
      const cookieResult = await persistAuthCookie(token, user)

      if (!cookieResult?.success) {
        const message = cookieResult?.message || 'Failed to persist login session.'
        setSnackbar({ open: true, message, status: 'error' })
        setErrorState(message)
        setIsLoginProcessing(false)
        return
      }
    }

    window.location.assign(resolveRedirectURL())
  }, [resolveRedirectURL])

  const handleCredentialsSubmit = async data => {
    if (isLoginProcessing) {
      return
    }

    setIsLoginProcessing(true)
    setSnackbar({ open: true, message: 'Logging In...', status: 'loading' })
    setErrorState(null)

    try {
      const authData = await loginWithCredentials({
        email: data.email,
        password: data.password,
      })

      const user = normalizeAuthUser(authData, data.email)

      setAuthSession({ token: authData.token, user })
      setIsLoginProcessing(false)
      setSnackbar({ open: true, message: 'Login Successful', status: 'success' })
    } catch (error) {
      const message = error?.message || 'Unable to sign in. Please try again.'
      setSnackbar({ open: true, message, status: 'error' })
      setErrorState(message)
      setIsLoginProcessing(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isLoginProcessing) {
      return
    }

    setIsLoginProcessing(true)
    setErrorState(null)
    setSnackbar({ open: true, message: 'Google sign-in is not available in this flow yet.', status: 'error' })
    setIsLoginProcessing(false)
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return {
    mode: initialMode,
    control,
    errors,
    handleSubmit,
    isPasswordShown,
    isLoginProcessing,
    snackbar,
    errorState,
    handlePasswordToggle,
    handleCredentialsSubmit,
    handleGoogleSignIn,
    handleCloseSnackbar,
    navigateToRedirect,
  }
}
