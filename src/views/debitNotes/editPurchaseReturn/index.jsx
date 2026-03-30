'use client';

import React from 'react';
import { Box } from '@mui/material';
import { IconButton } from '@mui/material';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';
import { updateDebitNote } from '@/app/(dashboard)/debitNotes/actions';

function EditPurchaseReturnContent({
  id,
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialDebitNoteData = null,
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  if (!initialDebitNoteData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>Failed to load debit note data</div>
        <div>ID: {id}</div>
        <div>Debit Note Data: Not available</div>
      </Box>
    );
  }

  const handleUpdate = async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Updating debit note...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateDebitNote(formData);
      closeSnackbar(loadingKey);

      if (!response?.success) {
        const errorMessage = response?.error?.message || response?.message || 'Failed to update debit note';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Debit note updated successfully!', {
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
    <EditPurchaseReturn
      debitNoteData={initialDebitNoteData}
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      signatures={initialSignatures}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
}

function EditPurchaseReturnIndex(props) {
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
      <EditPurchaseReturnContent {...props} />
    </SnackbarProvider>
  );
}

export default EditPurchaseReturnIndex;