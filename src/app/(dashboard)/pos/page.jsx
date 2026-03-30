import React from 'react';
import PosIndex from '@/views/pos';
import { getCustomers, getProducts, getTaxRates, getBanks, getManualSignatures } from '@/app/(dashboard)/invoices/add/actions';
import { getPosBootstrap } from '@/app/(dashboard)/pos/actions';

export const metadata = {
  title: 'Point Of Sale | Kanakku',
};

const PosPageRoute = async () => {
  try {
    const [
      customersData,
      productData,
      taxRates,
      initialBanks,
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

    return (
      <PosIndex
        customersData={customersData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
        branchesData={posBootstrap?.branches || []}
        posSettings={posBootstrap?.settings || {}}
        invoiceNumber={posBootstrap?.invoiceNumber || ''}
        paymentMethods={posBootstrap?.paymentMethods || []}
      />
    );
  } catch (error) {
    console.error('Error loading POS page data:', error);
    return <div className="text-red-600 p-8">Failed to load data for POS.</div>;
  }
};

export default PosPageRoute;
