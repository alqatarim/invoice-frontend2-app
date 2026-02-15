

import Login from '@/views/authentication/Login'
import GuestOnlyRoute from '@/Auth/GuestOnlyRoute'

import { getServerMode } from '@core/utils/serverHelpers'


const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return (
    <GuestOnlyRoute>
      <Login mode={mode} />
    </GuestOnlyRoute>
  )
}

export default LoginPage
