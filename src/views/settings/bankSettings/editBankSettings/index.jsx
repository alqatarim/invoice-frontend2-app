'use client'

import { useEffect } from 'react'
import { useBankSettingsHandlers } from '../handler'
import BankSettingsForm from '../shared/BankSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const EditBankSettingsIndex = ({ bankId, initialData = {} }) => {
  const {
    state,
    dataHandlers,
    actionHandlers
  } = useBankSettingsHandlers(initialData)

  useEffect(() => {
    if (bankId && !state.selectedBank) {
      dataHandlers.loadBankById(bankId)
    }
  }, [bankId, state.selectedBank])

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