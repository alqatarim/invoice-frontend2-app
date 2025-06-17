'use client'

import { useTaxSettingsHandlers } from '@/handlers/settings/useTaxSettingsHandlers'
import TaxSettingsList from './TaxSettingsList'
import TaxSettingsHead from './TaxSettingsHead'
import SettingsLayout from '../../shared/SettingsLayout'

const TaxSettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    dataHandlers,
    actionHandlers 
  } = useTaxSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Tax Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Tax Settings', current: true }
      ]}
    >
      <TaxSettingsHead />
      <TaxSettingsList
        taxes={state.taxes || []}
        pagination={state.pagination || {}}
        loading={state.loading}
        deleting={state.deleting}
        error={state.error}
        onRefresh={dataHandlers.loadTaxes}
        onDelete={actionHandlers.deleteTax}
        onClearError={actionHandlers.clearError}
      />
    </SettingsLayout>
  )
}

export default TaxSettingsIndex