import React from 'react';
import EditPurchaseOrder from '@/views/purchase-orders/editOrder';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditPurchaseOrderPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <EditPurchaseOrder orderId={params.id} />
    </ProtectedComponent>
  );
};

export default EditPurchaseOrderPage;