// app/(dashboard)/invoices/[id]/page.jsx

import { notFound } from 'next/navigation';
import EditInvoice from '@/views/invoices/editInvoice/EditInvoice';
import { getInvoiceById, getCustomers, getProducts, getTaxRates, getBanks, getManualSignatures } from '@/app/(dashboard)/invoices/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Invoice | Kanakku',
};

const EditInvoicePage = async ({ params }) => {
  const { id } = params;

  try {
    const [invoiceData, customers, products, taxRates, banks, signatures] = await Promise.all([
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
      <ProtectedComponent>
        <EditInvoice
          invoiceData={invoiceData}
          customersData={customers}
          productData={products}
          taxRates={taxRates}
          initialBanks={banks}
          signatures={signatures}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading invoice data:', error);
    notFound();
  }
};

export default EditInvoicePage;
