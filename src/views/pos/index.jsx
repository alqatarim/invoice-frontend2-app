'use client';

import React from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import Pos from './POS';
import { checkoutPosSale } from '@/app/(dashboard)/pos/actions';
import { usePosViewHandler } from './handler';

const PosContent = ({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialBranchesData = [],
  initialPosSettings = {},
  initialInvoiceNumber = '',
  initialPaymentMethods = [],
  initialCashiers = [],
  initialCurrentUserId = '',
  initialCanAccessPos = false,
  initialCanCreateInvoice = false,
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleCheckout = async (payload) => {
    try {
      const loadingKey = enqueueSnackbar('Completing sale...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await checkoutPosSale(payload);
      dismissSnackbar(loadingKey);

      return response;
    } catch (error) {
      dismissSnackbar();
      const errorMessage = error.message || 'Failed to complete POS checkout';

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const handler = usePosViewHandler({
    initialCustomersData,
    initialProductData,
    initialTaxRates,
    initialBanks,
    initialSignatures,
    initialBranchesData,
    initialPosSettings,
    initialInvoiceNumber,
    initialPaymentMethods,
    initialCashiers,
    initialCurrentUserId,
    initialCanAccessPos,
    initialCanCreateInvoice,
    initialErrorMessage,
    onSave: handleCheckout,
    enqueueSnackbar,
    closeSnackbar: dismissSnackbar,
  });

  return (
    <Pos
      initialCustomersData={initialCustomersData}
      initialProductData={initialProductData}
      initialTaxRates={initialTaxRates}
      initialInvoiceNumber={initialInvoiceNumber}
      controller={handler.controller}
      canAccessPos={handler.canAccessPos}
      canCreateInvoice={handler.canCreateInvoice}
      isPermissionsLoading={handler.isPermissionsLoading}
    />
  );
};

const PosIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <PosContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default PosIndex;
