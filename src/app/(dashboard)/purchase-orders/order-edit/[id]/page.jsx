
import React from 'react';
import EditPurchaseOrderIndex from '@/views/purchase-orders/editOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getPurchaseOrderDetails, getVendors, getProducts, getTaxRates, getBanks, getSignatures } from '@/app/(dashboard)/purchase-orders/actions';

export const metadata = {
  title: 'Edit Purchase Order | Invoicing System',
  description: 'Edit an existing purchase order'
};

const EditPurchaseOrderPage = async ({ params }) => {
  // Fetch initial data
  const [purchaseOrderData, vendorsData, productData, taxRates, initialBanks, signatures] = await Promise.all([
    getPurchaseOrderDetails(params.id),
    getVendors(),
    getProducts(),
    getTaxRates(),
    getBanks(),
    getSignatures()
  ]);

  // Handle errors
  if (!purchaseOrderData.success) {
    return (
      <ProtectedComponent>
        <div>Error loading data: {purchaseOrderData.message}</div>
      </ProtectedComponent>
    );
  }


  return (
    <ProtectedComponent>
      <EditPurchaseOrderIndex
        purchaseOrderData={purchaseOrderData.data}
        vendorsData={vendorsData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
      />
    </ProtectedComponent>
  );
};

export default EditPurchaseOrderPage;