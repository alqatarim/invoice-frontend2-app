import React from 'react';
import { getPaymentsList, getCustomers } from '../actions';
import PaymentListIndex from '@/views/payments/listPayment/index';
import ProtectedComponent from '@/components/ProtectedComponent';

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
      <ProtectedComponent>
        <PaymentListIndex
          initialData={initialData}
          initialCustomerOptions={customers || []}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading payment list data:', error);
    return <div className="text-red-600 p-8">Failed to load payment list.</div>;
  }
}

export default PaymentListPage;
