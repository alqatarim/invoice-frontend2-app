import { getPaymentById } from '../../actions'
import PaymentSummaryViewPage from '@/views/payment-summary/viewPaymentSummary/index'
import { notFound } from 'next/navigation'

export default async function PaymentSummaryViewPageRoute({ params }) {
  const { id } = params
  let initialPaymentData = null
  let initialErrorMessage = ''

  if (!id) {
    notFound()
  }

  try {
    initialPaymentData = await getPaymentById(id)

    if (!initialPaymentData) {
      notFound()
    }
  } catch (error) {
    console.error('Error loading payment summary data:', error)
    initialErrorMessage = error?.message || 'Failed to load payment data.'
  }

  return (
    <PaymentSummaryViewPage
      initialPaymentData={initialPaymentData}
      initialErrorMessage={initialErrorMessage}
    />
  )
}