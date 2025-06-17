'use client'

import { useState, useEffect } from 'react'
import { Skeleton, Alert, AlertTitle } from '@mui/material'
import { useTaxSettingsHandlers } from '@/handlers/settings/useTaxSettingsHandlers'

const TaxSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [initialLoading, setInitialLoading] = useState(!initialData.taxSettings)
  const handlers = useTaxSettingsHandlers(initialData.taxSettings || {})

  useEffect(() => {
    if (!initialData.taxSettings) {
      const loadData = async () => {
        await handlers.dataHandlers.loadTaxes()
        setInitialLoading(false)
      }

      loadData()
    }
  }, [initialData.taxSettings])

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
        <h3 className="text-lg font-medium mb-2">Tax Settings</h3>
        <p className="text-gray-500 mb-4">
          This feature is under development and will be integrated soon.
        </p>
        <p className="text-sm text-gray-400">
          Tax settings functionality is available as separate pages.
        </p>
      </div>
    </div>
  )
}

export default TaxSettingsTab