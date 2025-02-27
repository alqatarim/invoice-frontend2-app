import PaymentListIndex from '@/views/payments/listPayment/index';
import { getPaymentsList } from '../actions';

export const metadata = {
  title: 'Payments List | Invoices'
};

async function PaymentListPage() {
  try {
    // Directly await the data
    const initialData = await getPaymentsList();

    return <PaymentListIndex initialData={initialData} />;
  } catch (error) {
    console.error('Error fetching payments list:', error);
    return <div>Error loading payments list</div>;
  }
}

export default PaymentListPage;
