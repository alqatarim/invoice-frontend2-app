'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import PaymentSettingsForm from './PaymentSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const PaymentSettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    paymentSettingsHandlers 
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Payment Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Payment Settings', current: true }
      ]}
    >
      <PaymentSettingsForm
        paymentSettings={state.paymentSettings || {}}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={paymentSettingsHandlers.updatePaymentSettings}
        onRefresh={paymentSettingsHandlers.loadPaymentSettings}
      />
    </SettingsLayout>
  )
}

export default PaymentSettingsIndex