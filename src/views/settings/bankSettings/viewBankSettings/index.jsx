'use client'

import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'
import BankSettingsForm from '../shared/BankSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const ViewBankSettingsIndex = ({ bankId, initialData = {} }) => {
  const { 
    state, 
    actionHandlers 
  } = useBankSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="View Bank Account"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Bank Settings', href: '/settings/bank-settings/list' },
        { label: 'View Bank Account', current: true }
      ]}
    >
      <BankSettingsForm
        mode="view"
        bankData={state.selectedBank}
        loading={state.loading}
        error={state.error}
        onClearError={actionHandlers.clearError}
      />
    </SettingsLayout>
  )
}

export default ViewBankSettingsIndex