'use client';

import React, { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import AddSalesReturn from '@/views/salesReturn/addSalesReturn/AddSalesReturn';
import { addSalesReturn } from '@/app/(dashboard)/sales-return/actions';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';

const AddSalesReturnContent = ({
  initialCustomers = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialSalesReturnNumber = '',
}) => {
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleSave = useCallback(async (salesReturnData, employeeURL) => {
    try {
      const loadingKey = enqueueSnackbar('Creating sales return...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addSalesReturn(salesReturnData, employeeURL);
      dismissSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to create sales return';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Sales return created successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });

      return response;
    } catch (error) {
      dismissSnackbar();
      const errorMessage = error.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  }, [dismissSnackbar, enqueueSnackbar]);

  return (
    <AddSalesReturn
      customersData={initialCustomers}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      salesReturnNumber={initialSalesReturnNumber}
      onSave={handleSave}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={dismissSnackbar}
    />
  );
};

const AddSalesReturnIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <AddSalesReturnContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddSalesReturnIndex;
