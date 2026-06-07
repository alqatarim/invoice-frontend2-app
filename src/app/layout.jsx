import { Inter } from 'next/font/google'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { i18n } from '@configs/i18n'
import themeConfig from '@configs/themeConfig'
import { NextAuthProvider } from '@/Auth/nextAuthProvider'
import { arabicFontVariableClassName } from '@/lib/fonts/arabicFonts'
import { getSystemMode } from '@core/utils/serverHelpers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: 'variable',
})

import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import 'react-perfect-scrollbar/dist/css/styles.css'

export default function RootLayout({ children, params }) {
  const direction = i18n.langDirection[params?.lang] || i18n.langDirection.en || 'ltr'
  const systemMode = getSystemMode()

  return (
    <html
      id='__next'
      dir={direction}
      className={`${inter.variable} ${arabicFontVariableClassName}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} ${inter.variable} flex is-full min-bs-full flex-auto flex-col`}>
        <InitColorSchemeScript
          attribute='data'
          defaultMode={systemMode}
          modeStorageKey={`${themeConfig.settingsCookieName}-mui-mode`}
        />
        <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
