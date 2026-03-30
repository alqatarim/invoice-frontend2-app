'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import AddDebitNote from '@/views/debitNotes/addPurchaseReturn/AddDebitNote';
import { addDebitNote } from '@/app/(dashboard)/debitNotes/actions';

function AddPurchaseReturnContent({
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialDebitNoteNumber = '',
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAdd = async (formData, signatureURL) => {
    try {
      const loadingKey = enqueueSnackbar('Adding debit note...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addDebitNote(formData, signatureURL);
      closeSnackbar(loadingKey);

      if (!response?.success) {
        const errorMessage = response?.error?.message || response?.message || 'Failed to add debit note';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Debit note added successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });

      return response;
    } catch (error) {
      closeSnackbar();
      const errorMessage = error?.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AddDebitNote
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      signatures={initialSignatures}
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      debitNoteNumber={initialDebitNoteNumber}
    />
  );
}

function AddPurchaseReturnIndex(props) {
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
      <AddPurchaseReturnContent {...props} />
    </SnackbarProvider>
  );
}

export default AddPurchaseReturnIndex;