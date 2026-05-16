'use client'

import useCompanySettingsHandlers from './handler'
import CompanySettingsForm from './CompanySettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const CompanySettingsIndex = ({ initialData = {} }) => {
  const {
    companySettings,
    loading,
    updating,
    error,
    getCompanySettings,
    updateCompanySettings,
    clearError
  } = useCompanySettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updateCompanySettings(formData)
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  const handleRefresh = async () => {
    clearError()

    try {
      await getCompanySettings()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout initialData={initialData}>
      <CompanySettingsForm
        companySettings={companySettings || {}}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </SettingsLayout>
  )
}

export default CompanySettingsIndex