import React from 'react';
import EditPurchase from '@/views/purchases/editPurchase';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditPurchasePage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <EditPurchase purchaseId={params.id} />
    </ProtectedComponent>
  );
};

export default EditPurchasePage;