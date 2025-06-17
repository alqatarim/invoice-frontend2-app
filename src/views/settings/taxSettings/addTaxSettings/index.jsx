'use client'

import { useTaxSettingsHandlers } from '@/handlers/settings/useTaxSettingsHandlers'
import TaxSettingsForm from '../shared/TaxSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const AddTaxSettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    actionHandlers 
  } = useTaxSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Add Tax Rate"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Tax Settings', href: '/settings/tax-settings/list' },
        { label: 'Add Tax Rate', current: true }
      ]}
    >
      <TaxSettingsForm
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onSave={actionHandlers.addTax}
        isEdit={false}
      />
    </SettingsLayout>
  )
}

export default AddTaxSettingsIndex