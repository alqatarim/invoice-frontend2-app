import React from 'react';
import PurchaseOrderListIndex from '@/views/purchase-orders/listOrder/index';
import { getPurchaseOrderList } from '@/app/(dashboard)/purchase-orders/actions';

/**
 * PurchaseOrderListPage Component
 * Fetches initial purchase order data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const PurchaseOrderListPage = async () => {
  let initialPurchaseOrders = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialErrorMessage = '';

  try {
    const initialData = await getPurchaseOrderList(1, 10);
    initialPurchaseOrders = initialData?.data || [];
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialData?.totalRecords || 0
    };
  } catch (error) {
    console.error('Failed to fetch initial purchase order data:', error);
    initialErrorMessage = error?.message || 'Failed to load purchase orders.';
  }

  return (
    <PurchaseOrderListIndex
      initialPurchaseOrders={initialPurchaseOrders}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PurchaseOrderListPage;