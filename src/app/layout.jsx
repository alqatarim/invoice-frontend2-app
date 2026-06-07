import { Inter } from 'next/font/google'
import { i18n } from '@configs/i18n'
import { NextAuthProvider } from '@/Auth/nextAuthProvider'
import { arabicFontVariableClassName } from '@/lib/fonts/arabicFonts'
import { getServerMode } from '@core/utils/serverHelpers'
import { getThemeColorSchemeInitProps } from '@core/utils/colorScheme'

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
  const serverMode = getServerMode()
  const { script } = getThemeColorSchemeInitProps(serverMode)

  return (
    <html
      id='__next'
      dir={direction}
      className={`${inter.variable} ${arabicFontVariableClassName}`}
      data-mui-color-scheme={serverMode}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body className={`${inter.className} ${inter.variable} flex is-full min-bs-full flex-auto flex-col`}>
        <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
