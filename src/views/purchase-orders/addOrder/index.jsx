'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import AddPurchaseOrder from '@/views/purchase-orders/addOrder/AddPurchaseOrder';
import { addPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderContent = ({
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialPurchaseOrderNumber = '',
  initialErrorMessage = ''
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  const handleSave = useCallback(async (orderData, employeeURL) => {
    try {
      const loadingKey = enqueueSnackbar('Creating purchase order...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addPurchaseOrder(orderData, employeeURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = Array.isArray(response.errors)
          ? response.errors.join('\n')
          : response.message || 'Failed to create purchase order';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
      } else {
        enqueueSnackbar('Purchase order created successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An unexpected error occurred', { variant: 'error' });
      return {
        success: false,
        message: error.message || 'Failed to create purchase order'
      };
    }
  }, [closeSnackbar, enqueueSnackbar]);

  return (
    <AddPurchaseOrder
      onSave={handleSave}
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      purchaseOrderNumber={initialPurchaseOrderNumber}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const AddPurchaseOrderIndex = props => (
  <FormFeatureSnackbarProvider>
    <AddPurchaseOrderContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddPurchaseOrderIndex;