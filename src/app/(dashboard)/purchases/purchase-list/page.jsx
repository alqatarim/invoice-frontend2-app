import React from 'react';
import PurchaseList from '@/views/purchases/listPurchase';
import ProtectedComponent from '@/components/ProtectedComponent';

const PurchaseListPage = () => {
  return (
    <ProtectedComponent>
      <PurchaseList />
    </ProtectedComponent>
  );
};

export default PurchaseListPage;