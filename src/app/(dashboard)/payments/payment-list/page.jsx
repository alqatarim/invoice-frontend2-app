import React from 'react';
import { getPaymentsList, getCustomers } from '../actions';
import PaymentListIndex from '@/views/payments/listPayment/index';

export const metadata = {
  title: 'Payment List | Kanakku',
};

async function PaymentListPage() {
  try {
    const [initialData, customers] = await Promise.all([
      getPaymentsList(),
      getCustomers()
    ]);

    return (
      <PaymentListIndex
        initialData={initialData}
        initialCustomerOptions={customers || []}
      />
    );
  } catch (error) {
    console.error('Error loading payment list data:', error);
    return <div className="text-red-600 p-8">Failed to load payment list.</div>;
  }
}

export default PaymentListPage;
