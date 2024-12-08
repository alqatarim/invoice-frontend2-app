import React from 'react';
import PurchaseOrderList from '@/views/purchase-orders/listOrder';
import ProtectedComponent from '@/components/ProtectedComponent';

const PurchaseOrderListPage = () => {
  return (
    <ProtectedComponent>
      <PurchaseOrderList />
    </ProtectedComponent>
  );
};

export default PurchaseOrderListPage;