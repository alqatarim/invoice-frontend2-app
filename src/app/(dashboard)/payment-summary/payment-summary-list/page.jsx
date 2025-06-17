import { getInitialPaymentSummaryData, getCustomers } from '../actions'
import PaymentSummaryPage from '@/views/payment-summary/listPaymentSummary/index'

export default async function PaymentSummaryListPage() {
  try {
    // Get initial data and all customers (following invoice pattern)
    const [initialDataResponse, customersResponse] = await Promise.all([
      getInitialPaymentSummaryData(),
      getCustomers()
    ])

    return (
      <PaymentSummaryPage
        initialPayments={initialDataResponse.payments}
        initialPagination={initialDataResponse.pagination}
        initialCustomers={customersResponse}
      />
    )
  } catch (error) {
    console.error('Error loading payment summary page:', error)
    // Return page with empty data on error
    return (
      <PaymentSummaryPage
        initialPayments={[]}
        initialPagination={{ current: 1, pageSize: 10, total: 0 }}
        initialCustomers={[]}
      />
    )
  }
}