'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import PreferenceSettingsForm from './PreferenceSettingsForm'
import { getPreferenceSettings, updatePreferenceSettings, getCurrencies } from '@/app/(dashboard)/settings/preference-settings/actions'

const PreferenceSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [preferenceSettings, setPreferenceSettings] = useState(initialData.preferenceSettings || {})
  const [currencies, setCurrencies] = useState(initialData.currencies || [])
  const [loading, setLoading] = useState(!initialData.preferenceSettings && !initialData.currencies)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Load preference settings data and currencies only if not provided as initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [settingsResult, currenciesResult] = await Promise.all([
          getPreferenceSettings(),
          getCurrencies()
        ])

        if (settingsResult.success) {
          setPreferenceSettings(settingsResult.data || {})
        } else {
          setError(settingsResult.message)
        }

        if (currenciesResult.success) {
          setCurrencies(currenciesResult.data || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Only load data if we don't have initial data
    if (!initialData.preferenceSettings && !initialData.currencies) {
      loadData()
    }
  }, [initialData])

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating preference settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updatePreferenceSettings(formData)

      if (result.success) {
        setPreferenceSettings(result.data)
        enqueueSnackbar('Preference settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update preference settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update preference settings'
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
      const [settingsResult, currenciesResult] = await Promise.all([
        getPreferenceSettings(),
        getCurrencies()
      ])

      if (settingsResult.success) {
        setPreferenceSettings(settingsResult.data || {})
        setError(null)
      } else {
        setError(settingsResult.message)
      }

      if (currenciesResult.success) {
        setCurrencies(currenciesResult.data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadCurrencies = async () => {
    try {
      const result = await getCurrencies()
      if (result.success) {
        setCurrencies(result.data || [])
      }
    } catch (err) {
      console.error('Failed to load currencies:', err)
    }
  }

  return (
    <PreferenceSettingsForm
      preferenceSettings={preferenceSettings}
      currencies={currencies}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      onLoadCurrencies={handleLoadCurrencies}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default PreferenceSettingsTab