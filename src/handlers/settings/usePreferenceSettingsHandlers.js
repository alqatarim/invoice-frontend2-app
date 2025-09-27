import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const usePreferenceSettingsHandlers = (initialData = {}) => {
     const [preferenceSettings, setPreferenceSettings] = useState(initialData.preferenceSettings || {})
     const [currencies, setCurrencies] = useState(initialData.currencies || [])
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get preference settings
     const getPreferenceSettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getPreferenceSettings()

               if (result.success) {
                    setPreferenceSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch preference settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Get currencies
     const getCurrencies = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getCurrencies()

               if (result.success) {
                    setCurrencies(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch currencies')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update preference settings
     const updatePreferenceSettings = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.updatePreferenceSettings(formData)

               if (result.success) {
                    setPreferenceSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update preference settings')
               throw err
          } finally {
               setUpdating(false)
          }
     }

     // Clear error
     const clearError = () => {
          setError(null)
     }

     return {
          preferenceSettings,
          currencies,
          loading,
          updating,
          error,
          getPreferenceSettings,
          getCurrencies,
          updatePreferenceSettings,
          clearError
     }
}

export default usePreferenceSettingsHandlers
