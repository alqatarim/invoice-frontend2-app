import { Suspense } from 'react';
import ViewPaymentIndex from '@/views/payments/viewPayment/index';
import { getPaymentDetails } from '../../actions';

export const metadata = {
  title: 'View Payment | Invoices'
};

async function ViewPaymentPage({ params }) {
  const paymentData = await getPaymentDetails(params.id);

  return (

      <ViewPaymentIndex paymentData={paymentData} />

  );
}

export default ViewPaymentPage;
