'use client'

import { Alert, AlertTitle } from '@mui/material'
import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'

const BankSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const handlers = useBankSettingsHandlers(initialData || {})

  if (handlers.state.error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {handlers.state.error}
      </Alert>
    )
  }

  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Bank Settings</h3>
        <p className="text-gray-500 mb-4">
          This feature is under development and will be integrated soon.
        </p>
        <p className="text-sm text-gray-400">
          Bank settings functionality is available as separate pages.
        </p>
      </div>
    </div>
  )
}

export default BankSettingsTab