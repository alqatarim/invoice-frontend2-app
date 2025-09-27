// React Imports
import { useState } from 'react'

// Action Imports
import * as accountSettingsActions from '@/app/(dashboard)/settings/actions'

const useAccountSettingsHandlers = () => {
     const [accountSettings, setAccountSettings] = useState(null)
     const [loading, setLoading] = useState(false)
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     // Get account settings
     const getAccountSettings = async () => {
          setLoading(true)
          setError(null)

          try {
               const result = await accountSettingsActions.getAccountSettings()

               if (result.success) {
                    setAccountSettings(result.data)
                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to fetch account settings')
               throw err
          } finally {
               setLoading(false)
          }
     }

     // Update account settings
     const updateAccountSettings = async (data) => {
          setUpdating(true)
          setError(null)

          try {
               const formData = new FormData()
               formData.append('firstName', data.firstName)
               formData.append('lastName', data.lastName)
               formData.append('email', data.email)
               formData.append('mobileNumber', data.mobileNumber)
               formData.append('gender', data.gender || '')
               formData.append('DOB', data.DOB || '')

               if (data.image) {
                    formData.append('image', data.image)
               }

               const result = await accountSettingsActions.updateAccountSettings(formData)

               if (result.success) {
                    setAccountSettings(result.data?.updatedData)

                    // Update profile data in localStorage
                    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}')
                    profileData.firstName = result.data?.updatedData?.firstName
                    profileData.lastName = result.data?.updatedData?.lastName
                    profileData.image = result.data?.updatedData?.image
                    localStorage.setItem('profileData', JSON.stringify(profileData))

                    return result
               }
               throw new Error(result.message)
          } catch (err) {
               setError(err.message || 'Failed to update account settings')
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
          accountSettings,
          loading,
          updating,
          error,
          getAccountSettings,
          updateAccountSettings,
          clearError
     }
}

export default useAccountSettingsHandlers
