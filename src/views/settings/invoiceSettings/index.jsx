'use client'

import { useInvoiceSettingsHandlers } from './handler'
import InvoiceSettingsForm from './InvoiceSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const InvoiceSettingsIndex = ({ initialData = {} }) => {
  const {
    invoiceSettings,
    loading,
    updating,
    error,
    getInvoiceSettings,
    updateInvoiceSettings,
    clearError
  } = useInvoiceSettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updateInvoiceSettings(formData)
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
      await getInvoiceSettings()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout
      title="Invoice Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Invoice Settings', current: true }
      ]}
    >
      <InvoiceSettingsForm
        invoiceSettings={invoiceSettings || {}}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </SettingsLayout>
  )
}

export default InvoiceSettingsIndex