'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Box, Alert } from '@mui/material';
import ViewDebitNote from './ViewDebitNote';
import { cloneDebitNote, deleteDebitNote } from '@/app/(dashboard)/debitNotes/actions';

const ViewPurchaseReturnIndex = ({ debitNoteId, initialDebitNoteData = null, initialErrorMessage = '' }) => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/debitNotes/purchaseReturn-edit/${id}`);
    },
    [router]
  );

  const onDelete = useCallback(
    async id => {
      if (!id) return;

      try {
        const response = await deleteDebitNote(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Purchase return deleted successfully', {
            variant: 'success',
          });
          router.push('/debitNotes/purchaseReturn-list');
          return;
        }

        enqueueSnackbar(response.message || 'Failed to delete purchase return', {
          variant: 'error',
        });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete purchase return', {
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
        const response = await cloneDebitNote(id);

        if (response.success) {
          enqueueSnackbar(response.message || 'Purchase return cloned successfully', {
            variant: 'success',
          });
          return;
        }

        enqueueSnackbar(response.message || 'Failed to clone purchase return', {
          variant: 'error',
        });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to clone purchase return', {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar]
  );

  if (initialErrorMessage || !initialDebitNoteData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">{initialErrorMessage || 'No purchase return data found'}</Alert>
      </Box>
    );
  }

  return (
    <ViewDebitNote
      debitNoteData={initialDebitNoteData}
      debitNoteId={debitNoteId}
      onEdit={onEdit}
      onDelete={onDelete}
      onClone={onClone}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

export default ViewPurchaseReturnIndex;
