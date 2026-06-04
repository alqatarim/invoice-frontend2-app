'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import EditDeliveryChallan from './EditDeliveryChallan';
import { updateDeliveryChallan } from '@/app/(dashboard)/deliveryChallans/actions';

const EditDeliveryChallanContent = ({
  id,
  initialDeliveryChallanData,
  initialCustomers,
  initialProducts,
  initialTaxRates,
  initialBanks,
  initialSignatures,
  addBank,
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  useEffect(() => {
    if (String(initialDeliveryChallanData?.status || '').toUpperCase() === 'CONVERTED') {
      enqueueSnackbar('Converted delivery challans cannot be edited.', { variant: 'error' });
    }
  }, [enqueueSnackbar, initialDeliveryChallanData?.status]);

  const handleUpdate = useCallback(async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Updating delivery challan...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateDeliveryChallan(id, formData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.message || 'Failed to update delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar(response.message || 'Delivery challan updated successfully!', {
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
  }, [closeSnackbar, enqueueSnackbar, id]);

  const isConverted = String(initialDeliveryChallanData?.status || '').toUpperCase() === 'CONVERTED';

  return (
    <EditDeliveryChallan
      id={id}
      deliveryChallanData={initialDeliveryChallanData}
      customersData={initialCustomers}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      addBank={addBank}
      disabled={isConverted}
    />
  );
};

const EditDeliveryChallanIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <EditDeliveryChallanContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditDeliveryChallanIndex;
