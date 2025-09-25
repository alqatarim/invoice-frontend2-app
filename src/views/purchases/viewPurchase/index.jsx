'use client';

import React from 'react';
import ViewPurchase from './ViewPurchase';
import { Box, Alert } from '@mui/material';

const ViewPurchaseIndex = ({ purchaseId, initialData }) => {
  // Handle case where no data is provided
  if (!initialData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">No purchase data found</Alert>
      </Box>
    );
  }

  return (
    <ViewPurchase
      purchaseData={initialData}
      purchaseId={purchaseId}
    />
  );
};

export default ViewPurchaseIndex;