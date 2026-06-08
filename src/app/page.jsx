import { redirect } from 'next/navigation'

import { getHomeRedirect } from '@/Auth/serverAuth'

const RootPage = async () => {
  redirect(getHomeRedirect())
}

export default RootPage
