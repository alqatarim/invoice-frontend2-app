import React from 'react';
import ViewPurchaseOrder from '@/views/purchase-orders/viewOrder';
import ProtectedComponent from '@/components/ProtectedComponent';

const ViewPurchaseOrderPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <ViewPurchaseOrder orderId={params.id} />
    </ProtectedComponent>
  );
};

export default ViewPurchaseOrderPage;