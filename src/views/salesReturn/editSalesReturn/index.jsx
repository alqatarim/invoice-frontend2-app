'use client';

import React, { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import EditSalesReturn from '@/views/salesReturn/editSalesReturn/EditSalesReturn';
import { updateSalesReturn } from '@/app/(dashboard)/sales-return/actions';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';

const EditSalesReturnContent = ({
  id,
  initialSalesReturnData,
  initialCustomers,
  initialProducts,
  initialTaxRates,
  initialBanks,
  initialSignatures,
}) => {
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleSave = useCallback(async (data) => {
    try {
      const loadingKey = enqueueSnackbar('Updating sales return...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateSalesReturn({
        ...data,
        id,
        credit_note_id: data.credit_note_id || initialSalesReturnData.credit_note_id,
      });

      dismissSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update sales return';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Sales return updated successfully!', {
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
  }, [dismissSnackbar, enqueueSnackbar, id, initialSalesReturnData.credit_note_id]);

  return (
    <EditSalesReturn
      salesReturnData={initialSalesReturnData}
      customersData={initialCustomers}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      employees={initialSignatures}
      onSave={handleSave}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={dismissSnackbar}
    />
  );
};

const EditSalesReturnIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <EditSalesReturnContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditSalesReturnIndex;
