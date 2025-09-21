import { Inter } from 'next/font/google'
import { i18n } from '@configs/i18n'

import AuthWrapper from '@/Auth/AuthWrapper'
import Providers from '@components/Providers'
import { NextAuthProvider } from '@/Auth/nextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

export default function RootLayout({ children, params }) {
  const direction = i18n.langDirection[params.lang]

  const systemMode = getSystemMode()
  return (
    <html id='__next'>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
