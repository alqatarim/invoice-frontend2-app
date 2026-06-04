'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import { Box, Alert, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import ViewDeliveryChallan from './ViewDeliveryChallan';
import useDeliveryChallanViewHandler from './handler';
import { convertToInvoice, deleteDeliveryChallan } from '@/app/(dashboard)/deliveryChallans/actions';

const ViewDeliveryChallanIndex = ({
  initialDeliveryChallanData = null,
  initialErrorMessage = '',
}) => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onEdit = useCallback(
    (id) => {
      if (!id) return;
      if (String(initialDeliveryChallanData?.status || '').toUpperCase() === 'CONVERTED') {
        enqueueSnackbar('Converted delivery challans cannot be edited.', { variant: 'error' });
        return;
      }
      router.push(`/deliveryChallans/deliveryChallans-edit/${id}`);
    },
    [enqueueSnackbar, initialDeliveryChallanData?.status, router]
  );

  const onConvert = useCallback(
    async (id) => {
      if (!id) return;

      if (String(initialDeliveryChallanData?.status || '').toUpperCase() === 'CONVERTED') {
        enqueueSnackbar('This delivery challan has already been converted.', { variant: 'error' });
        return;
      }

      try {
        const loadingKey = enqueueSnackbar('Converting delivery challan...', {
          variant: 'info',
          persist: true,
          preventDuplicate: true,
        });

        const response = await convertToInvoice(id);
        closeSnackbar(loadingKey);

        if (!response?.success) {
          enqueueSnackbar(response.message || 'Failed to convert delivery challan', { variant: 'error' });
          return;
        }

        enqueueSnackbar(response.message || 'Delivery challan converted to invoice successfully', {
          variant: 'success',
        });
        router.refresh();
      } catch (error) {
        closeSnackbar();
        enqueueSnackbar(error.message || 'Failed to convert delivery challan', { variant: 'error' });
      }
    },
    [closeSnackbar, enqueueSnackbar, initialDeliveryChallanData?.status, router]
  );

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;

      try {
        const response = await deleteDeliveryChallan(id);

        if (response?.success) {
          enqueueSnackbar(response.message || 'Delivery challan deleted successfully', {
            variant: 'success',
          });
          router.push('/deliveryChallans/deliveryChallans-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to delete delivery challan', { variant: 'error' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete delivery challan', { variant: 'error' });
      }
    },
    [enqueueSnackbar, router]
  );

  const viewHandler = useDeliveryChallanViewHandler({
    deliveryChallanData: initialDeliveryChallanData,
    onEdit,
    onConvert,
    onDelete,
    enqueueSnackbar,
  });

  if (initialErrorMessage) {
    return (
      <Box className="p-4">
        <Alert severity="error">{initialErrorMessage}</Alert>
      </Box>
    );
  }

  if (!initialDeliveryChallanData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">Delivery challan not found</Alert>
      </Box>
    );
  }

  return (
    <ViewDeliveryChallan
      deliveryChallanData={initialDeliveryChallanData}
      viewHandler={viewHandler}
    />
  );
};

export default function ViewDeliveryChallanPage(props) {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeNotistackSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <ViewDeliveryChallanIndex {...props} />
    </SnackbarProvider>
  );
}
