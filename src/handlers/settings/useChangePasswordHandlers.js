import { useState } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

const useChangePasswordHandlers = () => {
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Change password
     const changePassword = async (formData) => {
          setUpdating(true)
          setError(null)

          try {
               const result = await settingsActions.changePassword(formData)

               if (result.success) {
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to change password')
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
          loading,
          updating,
          error,
          changePassword,
          clearError
     }
}

export default useChangePasswordHandlers
