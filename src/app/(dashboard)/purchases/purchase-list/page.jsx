import React from 'react';
import { getPurchaseList, getVendors } from '../actions';
import PurchaseListIndex from '@/views/purchases/listPurchase/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Purchase List | Kanakku',
};

async function PurchaseListPage() {
  try {
    const [initialData, vendors] = await Promise.all([
      getPurchaseList(),
      getVendors()
    ]);

    return (
      <ProtectedComponent>
        <PurchaseListIndex 
          initialData={initialData} 
          vendors={vendors}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading purchase list data:', error);
    return <div className="text-red-600 p-8">Failed to load purchase list.</div>;
  }
}

export default PurchaseListPage;