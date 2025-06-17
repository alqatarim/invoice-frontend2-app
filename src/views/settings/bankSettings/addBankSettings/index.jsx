'use client'

import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'
import BankSettingsForm from '../shared/BankSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const AddBankSettingsIndex = () => {
  const { 
    state, 
    actionHandlers 
  } = useBankSettingsHandlers()

  return (
    <SettingsLayout
      title="Add Bank Account"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Bank Settings', href: '/settings/bank-settings/list' },
        { label: 'Add Bank Account', current: true }
      ]}
    >
      <BankSettingsForm
        mode="add"
        loading={state.loading}
        error={state.error}
        onSubmit={actionHandlers.addBank}
        onClearError={actionHandlers.clearError}
      />
    </SettingsLayout>
  )
}

export default AddBankSettingsIndex