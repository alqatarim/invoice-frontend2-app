// React Imports
import { useEffect } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'



// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeChanger = ({ systemMode }) => {
  // Hooks
  const { setMode } = useColorScheme()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.mode && setMode) {
      console.log('[ModeChanger] settings.mode:', settings.mode)
      // Only set mode for manual selections (light/dark)
      // Let MUI handle 'system' mode automatically
      if (settings.mode !== 'system') {
        setMode(settings.mode)
      } else {
        setMode('system')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, setMode])

  return null
}

export default ModeChanger
