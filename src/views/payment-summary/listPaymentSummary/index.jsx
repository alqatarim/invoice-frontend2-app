'use client'

import PaymentSummaryList from './PaymentSummaryList'
import { usePaymentSummaryListHandlers } from '@/handlers/payment-summary/usePaymentSummaryListHandlers'

const PaymentSummaryPage = ({ initialPayments, initialPagination, initialCustomers }) => {
  const handlers = usePaymentSummaryListHandlers({
    initialPayments,
    initialPagination,
    initialCustomers,
  })

  // Note: Removed the problematic useEffect that was preventing initial data display
  // The old implementation shows initial data immediately and only fetches when filters are applied
  // Data fetching now happens through filter apply/reset actions and pagination changes

  return (
    <PaymentSummaryList
      {...handlers}
    />
  )
}

export default PaymentSummaryPage