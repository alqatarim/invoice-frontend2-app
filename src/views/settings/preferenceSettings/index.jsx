'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import PreferenceSettingsForm from './PreferenceSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const PreferenceSettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    preferenceHandlers 
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Preference Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Preference Settings', current: true }
      ]}
    >
      <PreferenceSettingsForm
        preferenceSettings={state.preferenceSettings || {}}
        currencies={state.currencies || []}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={preferenceHandlers.updatePreferenceSettings}
        onRefresh={preferenceHandlers.loadPreferenceSettings}
        onLoadCurrencies={preferenceHandlers.loadCurrencies}
      />
    </SettingsLayout>
  )
}

export default PreferenceSettingsIndex