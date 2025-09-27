import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const usePaymentSettingsHandlers = (initialData = {}) => {
     const [paymentSettings, setPaymentSettings] = useState(initialData.paymentSettings || {})
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get payment settings
     const getPaymentSettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await settingsActions.getPaymentSettings()

               if (result.success) {
                    setPaymentSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch payment settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update payment settings
     const updatePaymentSettings = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.updatePaymentSettings(formData)

               if (result.success) {
                    setPaymentSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update payment settings')
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
          paymentSettings,
          loading,
          updating,
          error,
          getPaymentSettings,
          updatePaymentSettings,
          clearError
     }
}

export default usePaymentSettingsHandlers
