import AddPaymentIndex from '@/views/payments/addPayment/index';
import { getCustomers, getPaymentNumber } from '@/app/(dashboard)/payments/actions';
export const metadata = {
  title: 'Add Payment | Invoices'
};

async function AddPaymentPage() {
  try {
    // Fetch data in parallel for better performance
    const [customers, paymentNo] = await Promise.all([
      getCustomers(),
      getPaymentNumber()
    ]);

    if (!customers || !paymentNo) {
      throw new Error('Failed to fetch required data');
    }

    return (
      <AddPaymentIndex customers={customers} paymentNo={paymentNo} />
    );

  } catch (error) {
    console.error('Error in AddPaymentPage:', error);

    // Return a more user-friendly error component
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600">
          Unable to load payment information. Please try again later.
        </p>
      </div>
    );
  }
}

export default AddPaymentPage;
