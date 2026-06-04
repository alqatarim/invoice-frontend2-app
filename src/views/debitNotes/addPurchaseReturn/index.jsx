'use client';

import React, { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
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

  const handleAdd = useCallback(
    async (formData, options = {}) => {
      const isDraft = Boolean(options.isDraft);

      try {
        const loadingKey = enqueueSnackbar(
          isDraft ? 'Saving purchase return draft...' : 'Adding purchase return...',
          {
            variant: 'info',
            persist: true,
            preventDuplicate: true,
          }
        );

        const response = await addDebitNote(formData);
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

        enqueueSnackbar(
          response.message ||
            (isDraft ? 'Purchase return saved as draft successfully' : 'Purchase return created successfully'),
          {
            variant: 'success',
            autoHideDuration: 3000,
          }
        );

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
    <AddDebitNote
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      debitNoteNumber={initialDebitNoteNumber}
    />
  );
}

function AddPurchaseReturnIndex(props) {
  return (
    <FormFeatureSnackbarProvider>
      <AddPurchaseReturnContent {...props} />
    </FormFeatureSnackbarProvider>
  );
}

export default AddPurchaseReturnIndex;
