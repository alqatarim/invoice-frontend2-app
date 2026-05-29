'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import AddPurchase from '@/views/purchases/addPurchase/AddPurchase';
import { addPurchase } from '@/app/(dashboard)/purchases/actions';

const AddPurchaseContent = ({
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialUnits = [],
  initialPurchaseNumber = '',
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
      const loadingKey = enqueueSnackbar('Creating purchase...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addPurchase(purchaseData, employeeURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = Array.isArray(response.errors)
          ? response.errors.join('\n')
          : response.message || 'Failed to create purchase';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
      } else {
        enqueueSnackbar('Purchase created successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An unexpected error occurred', { variant: 'error' });
      return {
        success: false,
        message: error.message || 'Failed to create purchase'
      };
    }
  }, [closeSnackbar, enqueueSnackbar]);

  return (
    <AddPurchase
      onSave={handleSave}
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      purchaseNumber={initialPurchaseNumber}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const AddPurchaseIndex = props => (
  <FormFeatureSnackbarProvider>
    <AddPurchaseContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddPurchaseIndex;