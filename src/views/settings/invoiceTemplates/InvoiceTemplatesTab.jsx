'use client'

import { useCallback, useEffect, useState } from 'react'
import InvoiceTemplatesView from './InvoiceTemplatesView'
import * as settingsActions from '@/app/(dashboard)/settings/actions'
import { usePermission } from '@/Auth/usePermission'

const buildInitialState = (initialData = {}) => {
  const initialTemplateData = initialData?.invoiceTemplates || null

  return {
    loading: !initialTemplateData?.defaultTemplateId,
    updating: false,
    error: null,
    data: initialTemplateData
  }
}

const InvoiceTemplatesTab = ({ initialData = {} }) => {
  const canUpdate = usePermission('invoiceTemplate', 'update')
  const [state, setState] = useState({
    ...buildInitialState(initialData)
  })

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getDefaultInvoiceTemplate()
      if (result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: result.data
        }))
        return result
      }

      throw new Error(result.message || 'Failed to load invoice template settings')
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        data: prev.data
      }))
      return { success: false, message: error.message }
    }
  }, [])

  useEffect(() => {
    if (initialData?.invoiceTemplates?.defaultTemplateId) {
      setState(buildInitialState(initialData))
      return
    }

    loadData()
  }, [initialData, loadData])

  const handleUpdate = async (templateId) => {
    if (!canUpdate) {
      return { success: false, message: 'You do not have permission to update invoice templates.' }
    }

    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.updateDefaultInvoiceTemplate(templateId)
      if (result.success) {
        setState(prev => ({
          ...prev,
          updating: false,
          data: result.data
        }))
        return result
      }

      throw new Error(result.message || 'Failed to update the default template')
    } catch (error) {
      setState(prev => ({
        ...prev,
        updating: false,
        error: error.message
      }))

      return { success: false, message: error.message }
    }
  }

  return (
    <InvoiceTemplatesView
      defaultTemplateId={state.data?.defaultTemplateId}
      loading={state.loading}
      updating={state.updating}
      error={state.error}
      onSetDefault={handleUpdate}
      onRefresh={loadData}
      canUpdate={canUpdate}
    />
  )
}

export default InvoiceTemplatesTab