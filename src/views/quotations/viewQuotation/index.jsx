'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Box, Alert } from '@mui/material';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import ViewQuotation from './ViewQuotation';
import {
  cloneQuotation,
  convertToInvoice,
  deleteQuotation,
  updateQuotationStatus,
} from '@/app/(dashboard)/quotations/actions';

const ViewQuotationContent = ({ quotationData, unitsList, productsList }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const onEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/quotations/quotation-edit/${id}`);
    },
    [router]
  );

  const onDelete = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await deleteQuotation(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Quotation deleted successfully', { variant: 'success' });
          router.push('/quotations/quotation-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to delete quotation', { variant: 'error' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete quotation', { variant: 'error' });
      }
    },
    [enqueueSnackbar, router]
  );

  const onClone = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await cloneQuotation(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Quotation cloned successfully', { variant: 'success' });
          if (response.data?._id) {
            router.push(`/quotations/quotation-edit/${response.data._id}`);
          }
          return;
        }

        enqueueSnackbar(response.message || 'Failed to clone quotation', { variant: 'error' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to clone quotation', { variant: 'error' });
      }
    },
    [enqueueSnackbar, router]
  );

  const onConvert = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await convertToInvoice(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Quotation converted to invoice successfully', {
            variant: 'success',
          });
          router.push('/quotations/quotation-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to convert quotation', { variant: 'error' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to convert quotation', { variant: 'error' });
      }
    },
    [enqueueSnackbar, router]
  );

  const onStatusChange = useCallback(
    async (id, status) => {
      if (!id || !status) return;

      try {
        const response = await updateQuotationStatus(id, status);

        if (response.success) {
          enqueueSnackbar(response.message || 'Quotation status updated successfully', { variant: 'success' });
          router.refresh();
          return;
        }

        enqueueSnackbar(response.message || 'Failed to update quotation status', { variant: 'error' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to update quotation status', { variant: 'error' });
      }
    },
    [enqueueSnackbar, router]
  );

  if (!quotationData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">No quotation data found</Alert>
      </Box>
    );
  }

  return (
    <ViewQuotation
      quotationData={quotationData}
      unitsList={unitsList}
      productsList={productsList}
      onEdit={onEdit}
      onDelete={onDelete}
      onClone={onClone}
      onConvert={onConvert}
      onStatusChange={onStatusChange}
      enqueueSnackbar={enqueueSnackbar}
    />
  );
};

const QuotationViewIndex = props => (
  <AppSnackbarProvider>
    <ViewQuotationContent {...props} />
  </AppSnackbarProvider>
);

export default QuotationViewIndex;
