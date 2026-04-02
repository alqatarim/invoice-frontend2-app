'use client'

import React from 'react'
import Login from '../Login'
import { useLoginHandler } from './handler'

const LoginIndex = ({ initialMode }) => {
  const controller = useLoginHandler({ initialMode })

  return <Login controller={controller} />
}

export default LoginIndex
