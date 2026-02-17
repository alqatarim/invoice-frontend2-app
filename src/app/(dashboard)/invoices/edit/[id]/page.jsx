// app/(dashboard)/invoices/[id]/page.jsx

import { notFound } from 'next/navigation';
import EditInvoiceIndex from '@/views/invoices/editInvoice/index';
import { getInvoiceById, getCustomers, getProducts, getTaxRates, getBanks, getManualSignatures } from '@/app/(dashboard)/invoices/actions';

export const metadata = {
  title: 'Edit Invoice | Kanakku',
};

const EditInvoicePage = async ({ params }) => {
  const { id } = params;

  try {
    const [invoiceData, customersData, productData, taxRates, initialBanks, signatures] = await Promise.all([
      getInvoiceById(id),
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getManualSignatures(),
    ]);

    if (!invoiceData) {
      notFound();
    }

    return (
      <EditInvoiceIndex
        id={id}
        invoiceData={invoiceData}
        customersData={customersData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
      />
    );
  } catch (error) {
    console.error('Error loading invoice data:', error);
    notFound();
  }
};

export default EditInvoicePage;
