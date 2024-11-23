

import Login from '@/views/authentication/Login'

import { getServerMode } from '@core/utils/serverHelpers'


const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
