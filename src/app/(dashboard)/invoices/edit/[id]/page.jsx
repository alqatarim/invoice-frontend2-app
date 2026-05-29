import React from 'react';
import { notFound } from 'next/navigation';
import EditInvoiceIndex from '@/views/invoices/editInvoice';
import {
  getBanks,
  getBranchesForDropdown,
  getCustomers,
  getInvoiceById,
  getInvoiceCashierBootstrap,
  getProducts,
  getTaxRates,
} from './actions';

export const metadata = {
  title: 'Edit Invoice | Kanakku',
};

const EditInvoicePage = async ({ params }) => {
  const { id } = params;

  try {
    const [
      initialInvoiceData,
      initialCustomersData,
      initialProductData,
      initialTaxRates,
      initialBanks,
      initialCashierBootstrap,
      initialBranchesData,
    ] = await Promise.all([
      getInvoiceById(id),
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getInvoiceCashierBootstrap(),
      getBranchesForDropdown(),
    ]);

    if (!initialInvoiceData || !initialInvoiceData._id) {
      notFound();
    }

    return (
      <EditInvoiceIndex
        initialInvoiceData={initialInvoiceData}
        initialCustomersData={initialCustomersData}
        initialProductData={initialProductData}
        initialTaxRates={initialTaxRates}
        initialBanks={initialBanks}
        initialCashiers={initialCashierBootstrap.cashiers}
        initialCurrentUserId={initialCashierBootstrap.currentUserId}
        initialBranchesData={initialBranchesData}
      />
    );
  } catch (error) {
    console.error('Error loading invoice data:', error);
    notFound();
  }
};

export default EditInvoicePage;
