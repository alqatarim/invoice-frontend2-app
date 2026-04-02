
import React from 'react';
import EditPurchaseOrderIndex from '@/views/purchase-orders/editOrder/index';
import { getPurchaseOrderDetails, getVendors, getProducts, getTaxRates, getBanks, getSignatures } from '@/app/(dashboard)/purchase-orders/actions';

export const metadata = {
  title: 'Edit Purchase Order | Invoicing System',
  description: 'Edit an existing purchase order'
};

const EditPurchaseOrderPage = async ({ params }) => {
  let initialPurchaseOrderData = null
  let initialVendors = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialErrorMessage = ''

  try {
    const [purchaseOrderData, vendorsData, productData, taxRates, banksData, signatures] = await Promise.all([
      getPurchaseOrderDetails(params.id),
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures()
    ]);

    if (!purchaseOrderData.success) {
      initialErrorMessage = purchaseOrderData.message || 'Error loading purchase order data'
    } else {
      initialPurchaseOrderData = purchaseOrderData.data
    }

    initialVendors = vendorsData
    initialProducts = productData
    initialTaxRates = taxRates
    initialBanks = banksData
    initialSignatures = signatures
  } catch (error) {
    console.error('Error loading purchase order data:', error)
    initialErrorMessage = error?.message || 'Error loading purchase order data'
  }

  return (
    <EditPurchaseOrderIndex
      orderId={params.id}
      initialPurchaseOrderData={initialPurchaseOrderData}
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default EditPurchaseOrderPage;