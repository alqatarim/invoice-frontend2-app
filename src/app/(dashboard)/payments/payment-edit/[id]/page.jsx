
import EditPaymentIndex from '@/views/payments/editPayment/index';
import { getPaymentDetails } from '../../actions';

export const metadata = {
  title: 'Edit Payment | Invoices'
};

async function EditPaymentPage({ params }) {
  const paymentData = await getPaymentDetails(params.id);

  return (

      <EditPaymentIndex paymentData={paymentData} />

  );
}

export default EditPaymentPage;
