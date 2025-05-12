'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import EditInvoice from '@/views/invoices/editInvoice/EditInvoice';
import { updateInvoice } from '@/app/(dashboard)/invoices/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const EditInvoiceContent = ({
  id,
  invoiceData,
  customersData,
  productData,
  taxRates,
  initialBanks,
  signatures
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleUpdate = async (updatedFormData) => {
    try {
      const loadingKey = enqueueSnackbar('Updating invoice...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateInvoice(invoiceData._id, updatedFormData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update invoice';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Invoice updated successfully!', {
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
    <EditInvoice
      invoiceData={invoiceData}
      customersData={customersData}
      productData={productData}
      taxRates={taxRates}
      initialBanks={initialBanks}
      signatures={signatures}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const EditInvoiceIndex = (props) => {
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
        horizontal: 'right'
      }}
    >
      <EditInvoiceContent {...props} />
    </SnackbarProvider>
  );
};

export default EditInvoiceIndex;