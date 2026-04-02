import React from 'react';
import AddPurchaseIndex from '@/views/purchases/addPurchase/index';
import {
  getBanks,
  getProducts,
  getPurchaseNumber,
  getSignatures,
  getTaxRates,
  getUnits,
  getVendors,
} from '@/app/(dashboard)/purchases/actions';

export const metadata = {
  title: 'Add Purchase | Kanakku',
};

const PurchaseAddPage = async () => {
  let initialVendors = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialUnits = []
  let initialPurchaseNumber = ''
  let initialErrorMessage = ''

  try {
    const [vendors, products, taxRates, banks, signatures, units, purchaseNumber] = await Promise.all([
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getUnits(),
      getPurchaseNumber(),
    ]);

    initialVendors = vendors || []
    initialProducts = products || []
    initialTaxRates = taxRates || []
    initialBanks = banks || []
    initialSignatures = signatures || []
    initialUnits = units || []
    initialPurchaseNumber = purchaseNumber?.data || ''
  } catch (error) {
    console.error('Error loading add purchase data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for Add Purchase.'
  }

  return (
    <AddPurchaseIndex
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialUnits={initialUnits}
      initialPurchaseNumber={initialPurchaseNumber}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PurchaseAddPage;