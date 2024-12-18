import React from 'react';
import EditPurchaseOrderIndex from '@/views/purchase-orders/editOrder';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Purchase Order | Invoicing System',
  description: 'Edit an existing purchase order'
};

const EditPurchaseOrderPage = ({ params }) => {
  return (
    <ProtectedComponent>
      <EditPurchaseOrderIndex orderId={params.id} />
    </ProtectedComponent>
  );
};

export default EditPurchaseOrderPage;