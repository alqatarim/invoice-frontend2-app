'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import EditPurchase from '@/views/purchases/editPurchase/EditPurchase';
import { updatePurchase } from '@/app/(dashboard)/purchases/actions';

const EditPurchaseContent = ({
  initialPurchaseData = null,
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialUnits = [],
  initialErrorMessage = ''
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  const handleSave = useCallback(async (purchaseData, employeeURL) => {
    try {
      const loadingKey = enqueueSnackbar('Updating purchase...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updatePurchase(purchaseData._id, purchaseData, employeeURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = Array.isArray(response.errors)
          ? response.errors.join('\n')
          : response.message || 'Failed to update purchase';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
      } else {
        enqueueSnackbar('Purchase updated successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An unexpected error occurred', { variant: 'error' });
      return {
        success: false,
        message: error.message || 'Failed to update purchase'
      };
    }
  }, [closeSnackbar, enqueueSnackbar]);

  return (
    <EditPurchase
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      purchaseData={initialPurchaseData}
      onSave={handleSave}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const EditPurchaseIndex = props => (
  <FormFeatureSnackbarProvider>
    <EditPurchaseContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditPurchaseIndex;
