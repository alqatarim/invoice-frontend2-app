import React from 'react';
import { getCustomers, getInitialPaymentData } from '../actions';
import PaymentListIndex from '@/views/payments/listPayment/index';

export const metadata = {
  title: 'Payment List | Kanakku',
};

async function PaymentListPage() {
  try {
    const [initialPaymentData, initialCustomerOptions] = await Promise.all([
      getInitialPaymentData(),
      getCustomers()
    ]);

    return (
      <PaymentListIndex
        initialPayments={initialPaymentData?.payments || []}
        initialPagination={
          initialPaymentData?.pagination || { current: 1, pageSize: 10, total: 0 }
        }
        initialCustomerOptions={initialCustomerOptions || []}
      />
    );
  } catch (error) {
    console.error('Error loading payment list data:', error);
    return <div className="text-red-600 p-8">Failed to load payment list.</div>;
  }
}

export default PaymentListPage;
