'use client'

import React from 'react'
import LoginForm from '../LoginForm'
import { useLoginHandler } from './handler'

const LoginIndex = ({ initialMode }) => {
  const controller = useLoginHandler({ initialMode })

  return <LoginForm controller={controller} />
}

export default LoginIndex
