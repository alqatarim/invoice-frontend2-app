'use client'

import { useEffect } from 'react'
import { useColorScheme } from '@mui/material/styles'
import { useCookie, useMedia } from 'react-use'
import { useSettings } from '@core/hooks/useSettings'
import { resolveColorSchemeMode } from '@core/utils/colorScheme'

const ModeSync = ({ systemMode }) => {
  const { setMode } = useColorScheme()
  const { settings } = useSettings()
  const [, updateColorPref] = useCookie('colorPref')
  const prefersDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')
  const mode = resolveColorSchemeMode(settings.mode, systemMode, prefersDark)

  useEffect(() => {
    setMode(mode)
    updateColorPref(mode)
  }, [mode, setMode, updateColorPref])

  return null
}

export default ModeSync
