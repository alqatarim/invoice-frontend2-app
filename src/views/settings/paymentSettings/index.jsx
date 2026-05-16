'use client'

import usePaymentSettingsHandlers from './handler'
import PaymentSettingsForm from './PaymentSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const PaymentSettingsIndex = ({ initialData = {} }) => {
  const {
    paymentSettings,
    loading,
    updating,
    error,
    getPaymentSettings,
    updatePaymentSettings,
    clearError
  } = usePaymentSettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updatePaymentSettings(formData)
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
      await getPaymentSettings()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout
      title="Payment Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Payment Settings', current: true }
      ]}
    >
      <PaymentSettingsForm
        paymentSettings={paymentSettings || {}}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </SettingsLayout>
  )
}

export default PaymentSettingsIndex