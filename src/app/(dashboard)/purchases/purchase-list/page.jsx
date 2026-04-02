import React from 'react';
import { getPurchaseList, getVendors } from '../actions';
import PurchaseListIndex from '@/views/purchases/listPurchase/index';

export const metadata = {
  title: 'Purchase List | Kanakku',
};

async function PurchaseListPage() {
  let initialPurchases = []
  let initialPagination = { current: 1, pageSize: 10, total: 0 }
  let initialVendors = []
  let initialErrorMessage = ''

  try {
    const [initialData, vendors] = await Promise.all([
      getPurchaseList(),
      getVendors()
    ]);

    initialPurchases = initialData?.data || []
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialData?.totalRecords || 0
    }
    initialVendors = vendors || []
  } catch (error) {
    console.error('Error loading purchase list data:', error);
    initialErrorMessage = error?.message || 'Failed to load purchase list.'
  }

  return (
    <PurchaseListIndex
      initialPurchases={initialPurchases}
      initialPagination={initialPagination}
      initialVendors={initialVendors}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default PurchaseListPage;