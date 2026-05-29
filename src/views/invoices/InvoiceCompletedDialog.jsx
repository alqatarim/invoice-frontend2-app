'use client';

import React, { useMemo } from 'react';
import SubmittedDialog from '@/components/dialogs/submitted-dialog';
import ViewInvoice from '@/views/invoices/viewInvoice/ViewInvoice';

const InvoiceCompletedDialog = ({ open, onClose, invoiceData, onNewInvoice }) => {
  const resolvedInvoice = useMemo(() => {
    if (!invoiceData) return null;
    return invoiceData.invoice || invoiceData.data || invoiceData;
  }, [invoiceData]);

  return (
    <SubmittedDialog
      open={open}
      onClose={onClose}
      onPrimaryAction={onNewInvoice}
      maxWidth="md"
      fullWidth
      printTitle={resolvedInvoice?.invoiceNumber || 'Invoice'}
      primaryLabel="New Invoice"
      primaryIcon="mdi:file-plus-outline"
      contentSx={{ bgcolor: 'background.default' }}
      previewSx={{
        width: '100%',
        maxWidth: 760,
        transform: 'scale(0.86)',
        transformOrigin: 'top center',
        mb: '-10%',
        '& .MuiPaper-root': {
          boxShadow: 'none',
        },
      }}
    >
      <ViewInvoice
        invoiceData={resolvedInvoice || {}}
        companyData={{ companyName: 'Company' }}
        currencyData="$"
      />
    </SubmittedDialog>
  );
};

export default InvoiceCompletedDialog;
