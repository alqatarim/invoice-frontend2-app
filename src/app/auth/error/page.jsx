'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const errorMessages = {
  AccessDenied: 'Google sign-in was cancelled or denied.',
  Callback: 'We could not complete the authentication callback.',
  Configuration: 'Google sign-in is not configured correctly.',
  CredentialsSignin: 'Invalid email or password.',
  OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
  OAuthCallback: 'Google sign-in failed during the callback.',
  OAuthSignin: 'Unable to start Google sign-in.',
  SessionRequired: 'Please sign in to continue.'
}

const decodeMessage = errorCode => {
  if (!errorCode) {
    return 'Authentication failed. Please try again.'
  }

  const decoded = decodeURIComponent(errorCode)

  return errorMessages[decoded] || decoded
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = decodeMessage(searchParams.get('error'))

  return (
    <Box className='flex min-bs-[100dvh] items-center justify-center p-6 bg-[var(--mui-palette-background-default)]'>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent className='flex flex-col gap-5 p-8'>
          <div>
            <Typography variant='h4' className='font-semibold'>
              Sign-in issue
            </Typography>
            <Typography color='text.secondary'>
              We could not complete the authentication request.
            </Typography>
          </div>

          <Alert severity='error'>{message}</Alert>

          <Button component={Link} href='/login' variant='contained'>
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

function AuthErrorFallback() {
  return (
    <Box className='flex min-bs-[100dvh] items-center justify-center p-6 bg-[var(--mui-palette-background-default)]'>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent className='flex flex-col gap-5 p-8'>
          <Typography variant='h4' className='font-semibold'>
            Sign-in issue
          </Typography>
          <Typography color='text.secondary'>
            Loading authentication details...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorContent />
    </Suspense>
  )
}
