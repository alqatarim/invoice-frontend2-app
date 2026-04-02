'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { passwordRegex, passwordValidMessage, emailRgx } from '../../../constants'
import { getLocalizedUrl } from '@/utils/i18n'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', status: 'loading' })
  const [errorState, setErrorState] = useState(null)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    const expired = searchParams.get('expired')
    const authError = searchParams.get('error')

    if (expired === 'true') {
      const message = 'Your session expired. Please sign in again.'
      setErrorState(message)
      setSnackbar({ open: true, message, status: 'error' })
      return
    }

    if (authError) {
      const message = getAuthErrorMessage(authError)
      setErrorState(message)
      setSnackbar({ open: true, message, status: 'error' })
    }
  }, [searchParams])

  const handlePasswordToggle = () => {
    setIsPasswordShown(show => !show)
  }

  const handleCredentialsSubmit = async data => {
    setSnackbar({ open: true, message: 'Logging In...', status: 'loading' })
    setErrorState(null)

    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      setSnackbar({ open: true, message: 'Login Successful', status: 'success' })
      const redirectURL = searchParams.get('redirectTo') ?? '/dashboard'

      setTimeout(() => {
        router.replace(getLocalizedUrl(redirectURL, locale))
      }, 1000)

      return
    }

    if (res?.error) {
      const error = getAuthErrorMessage(res.error)
      setSnackbar({ open: true, message: `An error occurred: ${error}`, status: 'error' })
      setErrorState(error)
    }
  }

  const handleGoogleSignIn = () => {
    const redirectURL = searchParams.get('redirectTo') ?? '/dashboard'

    setErrorState(null)
    setSnackbar({ open: true, message: 'Redirecting to Google...', status: 'loading' })

    signIn('google', {
      callbackUrl: getLocalizedUrl(redirectURL, locale)
    })
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
    snackbar,
    errorState,
    handlePasswordToggle,
    handleCredentialsSubmit,
    handleGoogleSignIn,
    handleCloseSnackbar,
  }
}
