'use client';

import React, { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import AddDeliveryChallan from './AddDeliveryChallan';
import { addDeliveryChallan, addBank } from '@/app/(dashboard)/deliveryChallans/actions';

const AddDeliveryChallanContent = ({
  initialCustomers,
  initialProducts,
  initialTaxRates,
  initialBanks,
  initialSignatures,
  initialDeliveryChallanNumber,
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAdd = useCallback(async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Adding delivery challan...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addDeliveryChallan(formData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.message || 'Failed to add delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar(response.message || 'Delivery challan added successfully!', {
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
  }, [closeSnackbar, enqueueSnackbar]);

  return (
    <AddDeliveryChallan
      customersData={initialCustomers}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      addBank={addBank}
      deliveryChallanNumber={initialDeliveryChallanNumber}
    />
  );
};

const AddDeliveryChallanIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <AddDeliveryChallanContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddDeliveryChallanIndex;
