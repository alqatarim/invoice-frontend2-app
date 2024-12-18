import React from 'react';
import ViewPurchaseOrderIndex from '@/views/purchase-orders/viewOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'View Purchase Order',
  description: 'View purchase order details'
};

const ViewPurchaseOrderPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <ViewPurchaseOrderIndex orderId={params.id} />
    </ProtectedComponent>
  );
};

export default ViewPurchaseOrderPage;