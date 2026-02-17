'use client';

import React from 'react';
import { Skeleton, Box } from '@mui/material';
import ViewDebitNote from './ViewDebitNote';
import { usePurchaseReturnViewHandlers } from '@/handlers/purchaseReturn/view/usePurchaseReturnViewHandlers';

const ViewPurchaseReturnIndex = ({ debitNoteId, initialDebitNoteData = null }) => {
  const handlers = usePurchaseReturnViewHandlers({
    debitNoteId,
    initialDebitNoteData,
  });

  if (handlers.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (!handlers.debitNoteData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>Failed to load purchase return data</div>
      </Box>
    );
  }

  return (
    <ViewDebitNote
      debitNoteData={handlers.debitNoteData}
      loading={handlers.isLoading}
    />
  );
};

export default ViewPurchaseReturnIndex;