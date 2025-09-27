import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const useEmailSettingsHandlers = (initialData = {}) => {
     const [emailSettings, setEmailSettings] = useState(initialData.emailSettings || {})
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get email settings
     const getEmailSettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getEmailSettings()

               if (result.success) {
                    setEmailSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch email settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update email settings
     const updateEmailSettings = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.updateEmailSettings(formData)

               if (result.success) {
                    setEmailSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update email settings')
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
          emailSettings,
          loading,
          updating,
          error,
          getEmailSettings,
          updateEmailSettings,
          clearError
     }
}

export default useEmailSettingsHandlers
