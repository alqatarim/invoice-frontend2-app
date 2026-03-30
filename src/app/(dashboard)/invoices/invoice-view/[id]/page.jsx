import React from 'react';

import InvoiceView from '@/views/invoices/viewInvoice';
import {
  getCompanySettings,
  getInvoiceById,
  getInvoiceSettings,
} from './actions';


const InvoiceViewPage = async ({ params }) => {
  const { id } = params;
  const invoiceData = await getInvoiceById(id);
  const companyId = invoiceData?.companyId?._id || invoiceData?.companyId || '';
  const companyData = companyId ? await getCompanySettings(companyId) : null;
  const invoiceSettings = await getInvoiceSettings();

  return (
    <InvoiceView
      initialInvoiceData={invoiceData}
      initialCompanyData={companyData}
      initialInvoiceSettings={invoiceSettings}
    />
  );
}

export default InvoiceViewPage;
