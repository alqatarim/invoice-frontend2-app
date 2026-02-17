import React from 'react';
import AddInvoiceIndex from '@/views/invoices/addInvoice/index';
import { getCustomers, getProducts, getTaxRates, getBanks, getManualSignatures, getNextInvoiceNumber } from '@/app/(dashboard)/invoices/actions';

export const metadata = {
  title: 'Add Invoice | Kanakku',
};

const AddInvoicePage = async () => {
  try {
    const [customersData, productData, taxRates, initialBanks, signatures, invoiceNumber] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getManualSignatures(),
      getNextInvoiceNumber(),
    ]);

    return (
      <AddInvoiceIndex
        customersData={customersData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
        invoiceNumber={invoiceNumber}
      />
    );
  } catch (error) {
    console.error('Error loading add invoice data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Invoice.</div>;
  }
};

export default AddInvoicePage;