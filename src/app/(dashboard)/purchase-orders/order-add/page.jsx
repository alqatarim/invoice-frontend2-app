import React from 'react';
import AddPurchaseOrderIndex from '@/views/purchase-orders/addOrder/index';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures, getPurchaseOrderNumber } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderPage = async () => {
  let initialVendors = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialPurchaseOrderNumber = ''
  let initialErrorMessage = ''

  try {
    const [vendors, products, taxRates, banks, signatures, purchaseOrderNumber] = await Promise.all([
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getPurchaseOrderNumber()
    ]);


    initialVendors = vendors
    initialProducts = products
    initialTaxRates = taxRates
    initialBanks = banks
    initialSignatures = signatures
    initialPurchaseOrderNumber = purchaseOrderNumber?.data || ''
  } catch (error) {
    console.error('Error loading form data:', error);
    initialErrorMessage = error?.message || 'Error loading form data'
  }

  return (
    <AddPurchaseOrderIndex
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialPurchaseOrderNumber={initialPurchaseOrderNumber}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default AddPurchaseOrderPage;