import React from 'react';
import { getInitialDeliveryChallanData, searchCustomers } from '../actions';
import DeliveryChallanListIndex from '@/views/deliveryChallans/listDeliveryChallans/index';

export const metadata = {
  title: 'Delivery Challan List | Kanakku',
};

async function DeliveryChallanListPage() {
  try {
    const [initialData, customers] = await Promise.all([
      getInitialDeliveryChallanData(),
      searchCustomers('') // Get all customers
    ]);

    return (
      <DeliveryChallanListIndex
        initialData={{
          data: initialData?.deliveryChallans || [],
          totalRecords: initialData?.pagination?.total || 0
        }}
        customers={customers}
      />
    );
  } catch (error) {
    console.error('Error loading delivery challan list data:', error);
    return <div className="text-red-600 p-8">Failed to load delivery challan list.</div>;
  }
}

export default DeliveryChallanListPage;