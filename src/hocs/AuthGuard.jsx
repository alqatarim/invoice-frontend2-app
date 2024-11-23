// Third-party Imports
import { getServerSession } from 'next-auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default async function AuthGuard({ children, locale }) {
  const session = await getServerSession()

  // Use AuthRedirect to handle redirection if no session
  return <>{session ? children : <AuthRedirect lang={locale} />}</>
}
