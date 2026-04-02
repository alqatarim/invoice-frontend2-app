import LoginIndex from '@/views/authentication/login'
import GuestOnlyRoute from '@/Auth/GuestOnlyRoute'

import { getServerMode } from '@core/utils/serverHelpers'


const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return (
    <GuestOnlyRoute>
      <LoginIndex initialMode={mode} />
    </GuestOnlyRoute>
  )
}

export default LoginPage
