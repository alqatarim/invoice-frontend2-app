'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import InvoiceSettingsForm from './InvoiceSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const InvoiceSettingsIndex = ({ initialData = {} }) => {
  const {
    state,
    invoiceSettingsHandlers
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Invoice Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Invoice Settings', current: true }
      ]}
    >
      <InvoiceSettingsForm
        invoiceSettings={state.invoiceSettings || {}}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={invoiceSettingsHandlers.updateInvoiceSettings}
        onRefresh={invoiceSettingsHandlers.loadInvoiceSettings}
      />
    </SettingsLayout>
  )
}

export default InvoiceSettingsIndex