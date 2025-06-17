import { getPaymentById } from '../../actions'
import PaymentSummaryViewPage from '@/views/payment-summary/viewPaymentSummary/index'

export default async function PaymentSummaryViewPageRoute({ params }) {
  const { id } = params
  const paymentResponse = await getPaymentById(id)
  
  const payment = paymentResponse.success ? paymentResponse.data : null

  return (
    <PaymentSummaryViewPage
      payment={payment}
      paymentId={id}
    />
  )
}