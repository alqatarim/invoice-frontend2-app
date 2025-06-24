'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { extendTheme, lighten, darken } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import CssBaseline from '@mui/material/CssBaseline'

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

import { deepmerge } from '@mui/utils'

const ThemeProvider = props => {
  // Props
  const { children, direction, systemMode } = props

  // Vars
  const isServer = typeof window === 'undefined'
  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Always set a valid mode
  let currentMode = 'light'; // default fallback
  if (isServer) {
    currentMode = systemMode || 'light';
  } else if (settings.mode === 'system') {
    currentMode = typeof isDark === 'boolean' ? (isDark ? 'dark' : 'light') : 'light';
  } else if (settings.mode) {
    currentMode = settings.mode;
  }

  console.log('[ThemeProvider] settings.mode:', settings.mode)
  console.log('[ThemeProvider] currentMode:', currentMode)

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    console.log('[ThemeProvider] Creating theme with currentMode:', currentMode, 'and primaryColor:', settings.primaryColor)
    
    // In MUI v7, we need to define color schemes statically
    const newColorScheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        }
      }
    }

    // Create the base theme with static colorSchemes
    const coreTheme = deepmerge(defaultCoreTheme(settings, 'light', direction), newColorScheme)

    return extendTheme(coreTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, direction])

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
      <CssVarsProvider
        theme={theme}
        defaultMode={settings.mode === 'system' ? 'system' : settings.mode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
        colorSchemeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-color-scheme`}
        attribute='data-mui-color-scheme'
        disableTransitionOnChange
      >
        <ModeChanger systemMode={systemMode} />
        <CssBaseline enableColorScheme />
        {children}
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
