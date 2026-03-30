'use client';

import React from 'react';
import { Paper } from '@mui/material';
import InvoiceActionBar from '@/components/invoices/InvoiceActionBar';
import InvoiceReceiptDialog from '@/components/invoices/InvoiceReceiptDialog';
import AppSnackbar from '@/components/shared/AppSnackbar';
import ViewInvoice from './ViewInvoice';
import { useInvoiceViewHandler } from './handler';

const ViewInvoiceIndex = ({
  initialInvoiceData = null,
  initialCompanyData = null,
  initialInvoiceSettings = null,
}) => {
  const handler = useInvoiceViewHandler({
    invoiceData: initialInvoiceData,
    companyData: initialCompanyData,
  });

  if (!initialInvoiceData?._id) {
    return (
      <Paper className='p-6 text-center text-error'>
        Invoice not found.
      </Paper>
    );
  }

  return (
    <>
      <InvoiceActionBar
        onPrint={handler.handlePrint}
        onDownload={handler.handleDownloadInvoice}
        onViewReceipt={handler.openReceipt}
      />

      <ViewInvoice
        invoiceData={initialInvoiceData}
        companyData={initialCompanyData}
        currencyData={handler.currencyData}
        invoiceLogo={initialInvoiceSettings?.invoiceLogo || ''}
        previewId={handler.previewId}
      />

      <InvoiceReceiptDialog
        open={handler.receiptOpen}
        loading={false}
        receiptText={handler.receiptText}
        onClose={handler.closeReceipt}
        onCopy={handler.handleCopyReceipt}
        onDownload={handler.handleDownloadReceipt}
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
        autoHideDuration={3000}
      />
    </>
  );
};

export default ViewInvoiceIndex;
