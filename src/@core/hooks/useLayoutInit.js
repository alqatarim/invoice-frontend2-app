'use client'

import { useEffect } from 'react'
import { useColorScheme } from '@mui/material'
import { useCookie, useMedia } from 'react-use'
import { useSettings } from '@core/hooks/useSettings'

const useLayoutInit = colorSchemeFallback => {
  const { settings } = useSettings()
  const { setMode } = useColorScheme()
  const [_, updateCookieColorPref] = useCookie('colorPref')
  const isDark = useMedia('(prefers-color-scheme: dark)', colorSchemeFallback === 'dark')

  useEffect(() => {
    const appMode = isDark ? 'dark' : 'light'

    updateCookieColorPref(appMode)

    if (settings.mode === 'system') {
      setMode(appMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark])
}

export default useLayoutInit
