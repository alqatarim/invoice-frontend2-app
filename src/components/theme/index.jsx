'use client'

import { useMemo } from 'react'
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'
import ModeSync from './ModeSync'
import themeConfig from '@configs/themeConfig'
import { useSettings } from '@core/hooks/useSettings'
import { resolveColorSchemeMode } from '@core/utils/colorScheme'
import defaultCoreTheme from '@core/theme'

const CustomThemeProvider = props => {
  const { children, direction, systemMode } = props
  const { settings } = useSettings()
  const prefersDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')
  const currentMode = resolveColorSchemeMode(settings.mode, systemMode, prefersDark)

  const theme = useMemo(() => {
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              lighter: lighten(settings.primaryColor, 0.4),
              lightest: lighten(settings.primaryColor, 0.6),
              dark: darken(settings.primaryColor, 0.1),
              contrastText: '#fff'
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              lighter: lighten(settings.primaryColor, 0.4),
              lightest: lighten(settings.primaryColor, 0.6),
              dark: darken(settings.primaryColor, 0.1),
              contrastText: '#fff'
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      }
    }

    return createTheme(deepmerge(defaultCoreTheme(settings, currentMode, direction), newTheme))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, currentMode])

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <ThemeProvider
        theme={theme}
        defaultMode={currentMode}
        modeStorageKey={`${themeConfig.settingsCookieName}-mui-mode`}
        disableTransitionOnChange
      >
        <ModeSync systemMode={systemMode} />
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
