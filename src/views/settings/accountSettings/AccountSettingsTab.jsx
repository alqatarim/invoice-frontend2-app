// React Imports
import { useEffect } from 'react'

// Component Imports
import AccountSettingsForm from './AccountSettingsForm'

// Handler Imports
import useAccountSettingsHandlers from '@/handlers/settings/useAccountSettingsHandlers'

const AccountSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
     const {
          accountSettings,
          loading,
          updating,
          error,
          getAccountSettings,
          updateAccountSettings,
          clearError
     } = useAccountSettingsHandlers()

     // Load account settings on mount
     useEffect(() => {
          if (!initialData?.accountSettings) {
               getAccountSettings()
          }
     }, [])

     const handleUpdate = async (formData) => {
          try {
               await updateAccountSettings(formData)
               enqueueSnackbar('Account settings updated successfully', { variant: 'success' })
          } catch (error) {
               enqueueSnackbar(error.message || 'Failed to update account settings', { variant: 'error' })
          }
     }

     const handleRefresh = async () => {
          clearError()
          await getAccountSettings()
     }

     return (
          <AccountSettingsForm
               accountSettings={accountSettings || initialData?.accountSettings}
               loading={loading}
               updating={updating}
               error={error}
               onUpdate={handleUpdate}
               onRefresh={handleRefresh}
          />
     )
}

export default AccountSettingsTab
