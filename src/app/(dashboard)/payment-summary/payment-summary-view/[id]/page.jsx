import { getPaymentById } from '../../actions'
import PaymentSummaryViewPage from '@/views/payment-summary/viewPaymentSummary/index'
import { notFound } from 'next/navigation'
import ProtectedComponent from '@/components/ProtectedComponent';

export default async function PaymentSummaryViewPageRoute({ params }) {
  const { id } = params
  let paymentResponse = null
  try {
    paymentResponse = await getPaymentById(id)

    return (
      <ProtectedComponent>
        <PaymentSummaryViewPage
          paymentData={paymentResponse}
          paymentId={id}
        />
      </ProtectedComponent>
    );

  } catch (error) {
    console.error('Error loading payment summary  data:', error);
    return <div className="text-red-600 p-8">Failed to load payment data.</div>;
  }




}