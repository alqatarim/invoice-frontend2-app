'use client';

import React from 'react';
import { resolveInvoiceTemplateId } from '@/common/invoiceTemplateCatalog';
import InvoiceOnePrinttable from '@/views/invoices/templates/InvoiceOnePrinttable';
import InvoiceTwoPrinttable from '@/views/invoices/templates/invoiceTwoPrinttable';
import InvoiceThreePrinttable from '@/views/invoices/templates/InvoiceThreePrintable';
import InvoiceFourPrinttable from '@/views/invoices/templates/InvoiceFourPrintable';
import InvoiceFivePrinttable from '@/views/invoices/templates/InvoiceFivePrintable';

const templateComponents = {
  '1': InvoiceOnePrinttable,
  '2': InvoiceTwoPrinttable,
  '3': InvoiceThreePrinttable,
  '4': InvoiceFourPrinttable,
  '5': InvoiceFivePrinttable,
};

const InvoiceTemplateRenderer = ({
  invoiceData,
  companyData,
  currencyData,
  invoiceLogo,
  templateId,
  captureId = 'invoice-template-preview',
  className = '',
}) => {
  const resolvedTemplateId = resolveInvoiceTemplateId(templateId);
  const TemplateComponent = templateComponents[resolvedTemplateId] || InvoiceOnePrinttable;

  return (
    <div id={captureId} className={className}>
      <TemplateComponent
        data={invoiceData}
        companyData={companyData || {}}
        currencyData={currencyData}
        invoiceLogo={invoiceLogo}
      />
    </div>
  );
};

export default InvoiceTemplateRenderer;
