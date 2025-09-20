import React from 'react';
import PurchaseOrderListIndex from '@/views/purchase-orders/listOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialPurchaseOrderData } from '@/app/(dashboard)/purchase-orders/actions';

/**
 * PurchaseOrderListPage Component
 * Fetches initial purchase order data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const PurchaseOrderListPage = async () => {
  // Fetch initial purchase order data on the server
  const initialData = await getInitialPurchaseOrderData();

  return (
    <ProtectedComponent>
      <PurchaseOrderListIndex
        initialData={initialData}
      />
    </ProtectedComponent>
  );
};

export default PurchaseOrderListPage;