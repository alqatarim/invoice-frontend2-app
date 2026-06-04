'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Box, Alert } from '@mui/material';
import ViewPurchaseOrder from './ViewPurchaseOrder';
import {
  clonePurchaseOrder,
  convertToPurchase,
  deletePurchaseOrder,
} from '@/app/(dashboard)/purchase-orders/actions';

const ViewPurchaseOrderIndex = ({ orderId, initialData }) => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/purchase-orders/order-edit/${id}`);
    },
    [router]
  );

  const onDelete = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await deletePurchaseOrder(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Purchase order deleted successfully', {
            variant: 'success',
          });
          router.push('/purchase-orders/order-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to delete purchase order', {
          variant: 'error',
        });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete purchase order', {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar, router]
  );

  const onClone = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await clonePurchaseOrder(id);

        if (response.success) {
          enqueueSnackbar(response.message || response.data?.message || 'Purchase order cloned successfully', {
            variant: 'success',
          });
          return;
        }

        enqueueSnackbar(response.message || 'Failed to clone purchase order', {
          variant: 'error',
        });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to clone purchase order', {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar]
  );

  const onConvert = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await convertToPurchase(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Purchase order converted to purchase successfully', {
            variant: 'success',
          });
          router.push('/purchase-orders/order-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to convert purchase order', {
          variant: 'error',
        });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to convert purchase order', {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar, router]
  );

  if (!initialData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">No purchase order data found</Alert>
      </Box>
    );
  }

  return (
    <ViewPurchaseOrder
      purchaseOrderData={initialData}
      orderId={orderId}
      onEdit={onEdit}
      onDelete={onDelete}
      onClone={onClone}
      onConvert={onConvert}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

export default ViewPurchaseOrderIndex;
