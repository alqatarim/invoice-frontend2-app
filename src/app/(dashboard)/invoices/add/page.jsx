import React from 'react';
import AddInvoiceIndex from '@/views/invoices/addInvoice';
import {
  getBanks,
  getBranchesForDropdown,
  getCustomers,
  getManualSignatures,
  getNextInvoiceNumber,
  getProducts,
  getTaxRates,
} from './actions';

export const metadata = {
  title: 'Add Invoice | Kanakku',
};

const AddInvoicePage = async () => {
  try {
    const [
      initialCustomersData,
      initialProductData,
      initialTaxRates,
      initialBanks,
      initialSignatures,
      initialInvoiceNumber,
      initialBranchesData,
    ] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getManualSignatures(),
      getNextInvoiceNumber(),
      getBranchesForDropdown(),
    ]);

    return (
      <AddInvoiceIndex
        initialCustomersData={initialCustomersData}
        initialProductData={initialProductData}
        initialTaxRates={initialTaxRates}
        initialBanks={initialBanks}
        initialSignatures={initialSignatures}
        initialInvoiceNumber={initialInvoiceNumber}
        initialBranchesData={initialBranchesData}
      />
    );
  } catch (error) {
    console.error('Error loading add invoice data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Invoice.</div>;
  }
};

export default AddInvoicePage;