'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import AddInvoice from './AddInvoice';
import { addInvoice } from '@/app/(dashboard)/invoices/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const AddInvoiceContent = ({ customersData, productData, taxRates, initialBanks, signatures, invoiceNumber }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAdd = async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Adding invoice...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addInvoice(formData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add invoice';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Invoice added successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
      return response;
    } catch (error) {
      closeSnackbar();
      const errorMessage = error.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AddInvoice
      customersData={customersData}
      productData={productData}
      taxRates={taxRates}
      initialBanks={initialBanks}
      signatures={signatures}
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      invoiceNumber={invoiceNumber}
    />
  );
};

const AddInvoiceIndex = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <AddInvoiceContent {...props} />
    </SnackbarProvider>
  );
};

export default AddInvoiceIndex;