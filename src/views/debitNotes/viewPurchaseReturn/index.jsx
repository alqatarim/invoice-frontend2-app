'use client';

import React from 'react';
import { Box } from '@mui/material';
import ViewDebitNote from './ViewDebitNote';

const ViewPurchaseReturnIndex = ({
  initialDebitNoteData = null,
  initialErrorMessage = '',
}) => {
  if (initialErrorMessage || !initialDebitNoteData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>{initialErrorMessage || 'Failed to load purchase return data'}</div>
      </Box>
    );
  }

  return (
    <ViewDebitNote
      debitNoteData={initialDebitNoteData}
      loading={false}
    />
  );
};

export default ViewPurchaseReturnIndex;