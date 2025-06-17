'use client'

import { useState, useEffect } from 'react'
import { Skeleton, Alert, AlertTitle } from '@mui/material'
import InvoiceTemplatesView from './InvoiceTemplatesView'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const InvoiceTemplatesTab = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  })

  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const result = await settingsActions.getDefaultInvoiceTemplate()
        if (result.success) {
          setState({
            loading: false,
            error: null,
            data: result.data
          })
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        setState({
          loading: false,
          error: error.message,
          data: null
        })
      }
    }

    loadData()
  }, [])

  const handleUpdate = async (templateId) => {
    try {
      const result = await settingsActions.updateDefaultInvoiceTemplate(templateId)
      if (result.success) {
        setState(prev => ({ ...prev, data: result.data }))
        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </div>
    )
  }

  if (state.error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {state.error}
      </Alert>
    )
  }

  return (
    <InvoiceTemplatesView
      defaultTemplate={state.data}
      onUpdate={handleUpdate}
    />
  )
}

export default InvoiceTemplatesTab