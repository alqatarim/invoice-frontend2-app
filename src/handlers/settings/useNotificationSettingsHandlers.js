import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const useNotificationSettingsHandlers = (initialData = {}) => {
     const [notificationSettings, setNotificationSettings] = useState(initialData.notificationSettings || {})
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get notification settings
     const getNotificationSettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getNotificationSettings()

               if (result.success) {
                    setNotificationSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch notification settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update notification settings
     const updateNotificationSettings = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.updateNotificationSettings(formData)

               if (result.success) {
                    setNotificationSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update notification settings')
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
          notificationSettings,
          loading,
          updating,
          error,
          getNotificationSettings,
          updateNotificationSettings,
          clearError
     }
}

export default useNotificationSettingsHandlers
