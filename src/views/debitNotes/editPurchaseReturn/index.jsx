'use client';

import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
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

  const handleUpdate = useCallback(
    async formData => {
      try {
        const loadingKey = enqueueSnackbar('Updating purchase return...', {
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

        enqueueSnackbar(response.message || 'Purchase return updated successfully!', {
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
    },
    [closeSnackbar, enqueueSnackbar]
  );

  return (
    <EditPurchaseReturn
      debitNoteData={initialDebitNoteData}
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
}

function EditPurchaseReturnIndex(props) {
  return (
    <FormFeatureSnackbarProvider>
      <EditPurchaseReturnContent {...props} />
    </FormFeatureSnackbarProvider>
  );
}

export default EditPurchaseReturnIndex;
