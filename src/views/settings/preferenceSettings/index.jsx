'use client'

import usePreferenceSettingsHandlers from './handler'
import PreferenceSettingsForm from './PreferenceSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const PreferenceSettingsIndex = ({ initialData = {} }) => {
  const {
    preferenceSettings,
    currencies,
    loading,
    updating,
    error,
    getPreferenceSettings,
    getCurrencies,
    updatePreferenceSettings,
    clearError
  } = usePreferenceSettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updatePreferenceSettings(formData)
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
      await getPreferenceSettings()
      await getCurrencies()
    } catch (error) {
      return null
    }
  }

  const handleLoadCurrencies = async () => {
    try {
      await getCurrencies()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout
      title="Preference Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Preference Settings', current: true }
      ]}
    >
      <PreferenceSettingsForm
        preferenceSettings={preferenceSettings || {}}
        currencies={currencies || []}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
        onLoadCurrencies={handleLoadCurrencies}
      />
    </SettingsLayout>
  )
}

export default PreferenceSettingsIndex