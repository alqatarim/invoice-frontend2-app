import React from 'react';
import PosIndex from '@/views/pos';
import {
  getBanks,
  getCustomers,
  getManualSignatures,
  getPosBootstrap,
  getProducts,
  getTaxRates,
} from '@/app/(dashboard)/pos/actions';

export const metadata = {
  title: 'Point Of Sale | Kanakku',
};

const PosPageRoute = async () => {
  let initialCustomersData = [];
  let initialProductData = [];
  let initialTaxRates = [];
  let initialBanks = [];
  let initialSignatures = [];
  let initialBranchesData = [];
  let initialPosSettings = {};
  let initialInvoiceNumber = '';
  let initialPaymentMethods = [];
  let initialErrorMessage = '';

  try {
    const [
      customersData,
      productData,
      taxRates,
      banks,
      signatures,
      posBootstrap,
    ] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getManualSignatures(),
      getPosBootstrap(),
    ]);

    initialCustomersData = customersData || [];
    initialProductData = productData || [];
    initialTaxRates = taxRates || [];
    initialBanks = banks || [];
    initialSignatures = signatures || [];
    initialBranchesData = posBootstrap?.branches || [];
    initialPosSettings = posBootstrap?.settings || {};
    initialInvoiceNumber = posBootstrap?.invoiceNumber || '';
    initialPaymentMethods = posBootstrap?.paymentMethods || [];
  } catch (error) {
    console.error('Error loading POS page data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for POS.';
  }

  return (
    <PosIndex
      initialCustomersData={initialCustomersData}
      initialProductData={initialProductData}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialBranchesData={initialBranchesData}
      initialPosSettings={initialPosSettings}
      initialInvoiceNumber={initialInvoiceNumber}
      initialPaymentMethods={initialPaymentMethods}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PosPageRoute;
