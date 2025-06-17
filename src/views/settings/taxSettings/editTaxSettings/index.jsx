'use client'

import { useEffect } from 'react'
import { useTaxSettingsHandlers } from '@/handlers/settings/useTaxSettingsHandlers'
import TaxSettingsForm from '../shared/TaxSettingsForm'
import SettingsLayout from '../../shared/SettingsLayout'

const EditTaxSettingsIndex = ({ taxId, initialData = {} }) => {
  const { 
    state, 
    actionHandlers 
  } = useTaxSettingsHandlers(initialData)

  const id = taxId
  const currentTax = state.currentTax || state.selectedTax || initialData.selectedTax

  useEffect(() => {
    if (id && !currentTax) {
      actionHandlers.getTaxById(id)
    }
  }, [id])

  const handleUpdate = async (formData) => {
    return await actionHandlers.updateTax(id, formData)
  }

  return (
    <SettingsLayout
      title="Edit Tax Rate"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Tax Settings', href: '/settings/tax-settings/list' },
        { label: 'Edit Tax Rate', current: true }
      ]}
    >
      <TaxSettingsForm
        tax={currentTax}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onSave={handleUpdate}
        isEdit={true}
      />
    </SettingsLayout>
  )
}

export default EditTaxSettingsIndex