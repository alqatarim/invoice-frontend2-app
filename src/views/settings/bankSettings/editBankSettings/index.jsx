'use client'

import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'
import BankSettingsForm from '../shared/BankSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const EditBankSettingsIndex = ({ bankId, initialData = {} }) => {
  const { 
    state, 
    actionHandlers 
  } = useBankSettingsHandlers(initialData)

  const handleUpdate = async (formData) => {
    return await actionHandlers.updateBank(bankId, formData)
  }

  return (
    <SettingsLayout
      title="Edit Bank Account"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Bank Settings', href: '/settings/bank-settings/list' },
        { label: 'Edit Bank Account', current: true }
      ]}
    >
      <BankSettingsForm
        mode="edit"
        bankData={state.selectedBank}
        loading={state.loading}
        error={state.error}
        onSubmit={handleUpdate}
        onClearError={actionHandlers.clearError}
      />
    </SettingsLayout>
  )
}

export default EditBankSettingsIndex