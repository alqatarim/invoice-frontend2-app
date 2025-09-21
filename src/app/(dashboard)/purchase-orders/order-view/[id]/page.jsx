import React from 'react';
import ViewPurchaseOrderIndex from '@/views/purchase-orders/viewOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getPurchaseOrderDetails } from '@/app/(dashboard)/purchase-orders/actions';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'View Purchase Order',
  description: 'View purchase order details'
};

const ViewPurchaseOrderPage = async ({ params }) => {
  try {
    // Fetch purchase order data on the server
    const response = await getPurchaseOrderDetails(params.id);

    if (!response.success || !response.data) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <ViewPurchaseOrderIndex
          orderId={params.id}
          initialData={response.data}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    notFound();
  }
};

export default ViewPurchaseOrderPage;