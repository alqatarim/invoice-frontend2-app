'use client';

import React from 'react';
import { Paper } from '@mui/material';
import InvoiceActionBar from '@/components/invoices/InvoiceActionBar';
import CustomerPosReceiptDialog from '@/components/receipts/CustomerPosReceiptDialog';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
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
    <AppSnackbarProvider maxSnack={7}>
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

      <CustomerPosReceiptDialog
        open={handler.receiptOpen}
        loading={false}
        receiptData={handler.receiptData}
        onClose={handler.closeReceipt}
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
        autoHideDuration={3000}
      />
    </AppSnackbarProvider>
  );
};

export default ViewInvoiceIndex;
