import PaymentListIndex from '@/views/payments/listPayment/index';
import { getInitialPaymentData, getCustomers } from '../actions';

export const metadata = {
  title: 'Payments List | Invoices'
};

async function PaymentListPage() {
  try {
    // Fetch initial data in parallel
    const [initialData, customersData] = await Promise.all([
      getInitialPaymentData(),
      getCustomers()
    ]);

    return <PaymentListIndex 
      initialData={initialData} 
      initialCustomerOptions={customersData || []}
    />;
  } catch (error) {
    console.error('Error fetching payments list:', error);
    return <div>Error loading payments list</div>;
  }
}

export default PaymentListPage;
