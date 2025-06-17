'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import CompanySettingsForm from './CompanySettingsForm'
import { getCompanySettings, updateCompanySettings } from '@/app/(dashboard)/settings/company-settings/actions'

const CompanySettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [companySettings, setCompanySettings] = useState(initialData || {})
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      enqueueSnackbar('Updating company settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateCompanySettings(formData)

      if (result.success) {
        setCompanySettings(result.data)
        enqueueSnackbar('Company settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update company settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update company settings'
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      })
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setUpdating(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const result = await getCompanySettings()
      if (result.success) {
        setCompanySettings(result.data || {})
        setError(null)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CompanySettingsForm
      companySettings={companySettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default CompanySettingsTab