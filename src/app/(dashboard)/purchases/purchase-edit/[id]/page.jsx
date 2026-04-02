import React from 'react';
import { notFound } from 'next/navigation';
import EditPurchaseIndex from '@/views/purchases/editPurchase/index';
import {
  getBanks,
  getProducts,
  getPurchaseDetails,
  getSignatures,
  getTaxRates,
  getUnits,
  getVendors,
} from '@/app/(dashboard)/purchases/actions';

export const metadata = {
  title: 'Edit Purchase | Kanakku',
};

const PurchaseEditPage = async ({ params }) => {
  const { id } = params;

  if (!id) {
    notFound();
  }

  let initialPurchaseData = null
  let initialVendors = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialUnits = []
  let initialErrorMessage = ''

  try {
    const [purchaseResponse, vendors, products, taxRates, banks, signatures, units] = await Promise.all([
      getPurchaseDetails(id),
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getUnits(),
    ]);

    if (!purchaseResponse.success || !purchaseResponse.data) {
      initialErrorMessage = purchaseResponse?.message || 'Failed to load purchase data for editing.'
    } else {
      initialPurchaseData = purchaseResponse.data
    }
    initialVendors = vendors || []
    initialProducts = products || []
    initialTaxRates = taxRates || []
    initialBanks = banks || []
    initialSignatures = signatures || []
    initialUnits = units || []
  } catch (error) {
    console.error('Error loading edit purchase data:', error);
    initialErrorMessage = error?.message || 'Failed to load purchase data for editing.'
  }

  return (
    <EditPurchaseIndex
      initialPurchaseData={initialPurchaseData}
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialUnits={initialUnits}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PurchaseEditPage;

