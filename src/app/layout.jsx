import { Inter } from 'next/font/google'
import { i18n } from '@configs/i18n'
import { NextAuthProvider } from '@/Auth/nextAuthProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap'
})

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

export default function RootLayout({ children, params }) {
  const direction = i18n.langDirection[params?.lang] || i18n.langDirection.en || 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className={`${inter.className} ${inter.variable} flex is-full min-bs-full flex-auto flex-col`}>
        <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
