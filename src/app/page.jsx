import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/Auth/auth'
import { isTokenExpired } from '@/Auth/tokenUtils'

const RootPage = async () => {
  const session = await getServerSession(authOptions)
  const token = session?.user?.token

  if (token && !isTokenExpired(token)) {
    redirect('/dashboard')
  }

  redirect('/login')
}

export default RootPage
