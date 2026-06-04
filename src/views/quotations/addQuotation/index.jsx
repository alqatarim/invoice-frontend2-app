'use client';

import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import AddQuotation from './AddQuotation';
import useAddQuotationFeatureHandler from './handler';
import { createQuotation } from '@/app/(dashboard)/quotations/actions';

const AddQuotationContent = ({
  initialCustomers = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialQuotationNumber = '',
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
      const isDraft = Boolean(options.isDraft);

      try {
        const loadingKey = enqueueSnackbar(
          isDraft ? 'Saving quotation draft...' : 'Creating quotation...',
          {
            variant: 'info',
            persist: true,
            preventDuplicate: true,
          }
        );

        const response = await createQuotation(quotationData);
        closeSnackbar(loadingKey);

        if (!response.success) {
          enqueueSnackbar(response.message || 'Failed to create quotation', {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
          return { success: false, message: response.message };
        }

        enqueueSnackbar(
          response.message || (isDraft ? 'Quotation saved as draft successfully' : 'Quotation created successfully'),
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
    [closeSnackbar, enqueueSnackbar]
  );

  const controller = useAddQuotationFeatureHandler({
    initialQuotationNumber,
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

  return (
    <>
      <AddQuotation
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

const AddQuotationIndex = props => (
  <FormFeatureSnackbarProvider>
    <AddQuotationContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddQuotationIndex;
