'use client';

import React, { useCallback, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import EditQuotation from './EditQuotation';
import useEditQuotationFeatureHandler from './handler';
import { updateQuotation } from '@/app/(dashboard)/quotations/actions';

const EditQuotationContent = ({
  initialQuotationData = null,
  initialCustomers = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialErrorMessage = '',
  addBank = null,
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  const handleSave = useCallback(
    async (quotationData, options = {}) => {
      if (!initialQuotationData?._id) {
        enqueueSnackbar('Invalid quotation ID', { variant: 'error' });
        return { success: false, message: 'Invalid quotation ID' };
      }

      const isDraft = Boolean(options.isDraft);

      try {
        const loadingKey = enqueueSnackbar(
          isDraft ? 'Saving quotation draft...' : 'Updating quotation...',
          {
            variant: 'info',
            persist: true,
            preventDuplicate: true,
          }
        );

        const response = await updateQuotation(initialQuotationData._id, quotationData);
        closeSnackbar(loadingKey);

        if (!response.success) {
          enqueueSnackbar(response.message || 'Failed to update quotation', {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
          return { success: false, message: response.message };
        }

        enqueueSnackbar(
          response.message || (isDraft ? 'Quotation saved as draft successfully' : 'Quotation updated successfully'),
          {
            variant: 'success',
            autoHideDuration: 3000,
          }
        );

        return response;
      } catch (error) {
        closeSnackbar();
        const errorMessage = error.message || 'An unexpected error occurred';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        return { success: false, message: errorMessage };
      }
    },
    [closeSnackbar, enqueueSnackbar, initialQuotationData?._id]
  );

  const controller = useEditQuotationFeatureHandler({
    initialQuotationData,
    customersData: initialCustomers,
    productData: initialProducts,
    taxRates: initialTaxRates,
    initialBanks,
    employees: initialSignatures,
    onSave: handleSave,
    addBank,
    enqueueSnackbar,
    closeSnackbar,
  });

  if (!initialQuotationData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!initialQuotationData._id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h6">Quotation not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <EditQuotation
        controller={controller}
        customersData={initialCustomers}
        productData={initialProducts}
      />

      <BankDetailsDialog
        open={controller.openBankModal}
        onClose={() => controller.setOpenBankModal(false)}
        newBank={controller.newBank}
        setNewBank={controller.setNewBank}
        handleAddBank={controller.handleAddBank}
      />
    </>
  );
};

const EditQuotationIndex = props => (
  <FormFeatureSnackbarProvider>
    <EditQuotationContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditQuotationIndex;
