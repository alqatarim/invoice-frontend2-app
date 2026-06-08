'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { passwordRegex, passwordValidMessage, emailRgx } from '../../../constants'
import { getLocalizedUrl } from '@/utils/i18n'
import { authApi } from '@/Auth/authApi'
import { persistAuthCookie } from '@/Auth/authActions'
import { getStoredSession, normalizeAuthUser, setAuthSession } from '@/Auth/session'

const schema = yup.object({
  email: yup.string().matches(emailRgx, 'Please Enter valid Email').required('Email is required').trim(),
  password: yup.string().matches(passwordRegex, passwordValidMessage).required('Password is Required').trim(),
}).required()

const authErrorMessages = {
  AccessDenied: 'Google sign-in was cancelled or denied.',
  Callback: 'Unable to complete sign-in. Please try again.',
  Configuration: 'Google sign-in is not configured correctly.',
  CredentialsSignin: 'Invalid email or password.',
  OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
  OAuthCallback: 'Google sign-in failed during the callback.',
  OAuthSignin: 'Unable to start Google sign-in.',
  SessionRequired: 'Please sign in to continue.'
}

const getAuthErrorMessage = errorCode => {
  if (!errorCode) {
    return ''
  }

  const decodedError = decodeURIComponent(errorCode)
  return authErrorMessages[decodedError] || decodedError
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
      const authData = await authApi.login({
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
