import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const useCompanySettingsHandlers = (initialData = {}) => {
     const [companySettings, setCompanySettings] = useState(initialData.companySettings || {})
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get company settings
     const getCompanySettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getCompanySettings()

               if (result.success) {
                    setCompanySettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch company settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update company settings
     const updateCompanySettings = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.updateCompanySettings(formData)

               if (result.success) {
                    setCompanySettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update company settings')
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
          companySettings,
          loading,
          updating,
          error,
          getCompanySettings,
          updateCompanySettings,
          clearError
     }
}

export default useCompanySettingsHandlers
