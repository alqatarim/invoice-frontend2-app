'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import EditPurchaseOrder from '@/views/purchase-orders/editOrder/EditPurchaseOrder';
import { updatePurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const EditPurchaseOrderContent = ({
  orderId,
  initialPurchaseOrderData,
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
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
      const loadingKey = enqueueSnackbar('Updating purchase order...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updatePurchaseOrder(orderId, orderData, employeeURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = Array.isArray(response.errors)
          ? response.errors.join('\n')
          : response.message || 'Failed to update purchase order';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
      } else {
        enqueueSnackbar('Purchase order updated successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An unexpected error occurred', { variant: 'error' });
      return {
        success: false,
        message: error.message || 'Failed to update purchase order'
      };
    }
  }, [closeSnackbar, enqueueSnackbar, orderId]);

  return (
    <EditPurchaseOrder
      purchaseOrderData={initialPurchaseOrderData}
      onSave={handleSave}
      vendorsData={initialVendors}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const EditPurchaseOrderIndex = props => (
  <FormFeatureSnackbarProvider>
    <EditPurchaseOrderContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditPurchaseOrderIndex;