'use client'

import { useState, useEffect } from 'react'
import { Skeleton, Alert, AlertTitle } from '@mui/material'
import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'

const BankSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [initialLoading, setInitialLoading] = useState(!initialData.bankSettings)
  const handlers = useBankSettingsHandlers(initialData.bankSettings || {})

  useEffect(() => {
    if (!initialData.bankSettings) {
      const loadData = async () => {
        await handlers.dataHandlers.loadBanks()
        setInitialLoading(false)
      }

      loadData()
    }
  }, [initialData.bankSettings])

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </div>
    )
  }

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