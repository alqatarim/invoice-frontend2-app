'use client';

import React from 'react';
import ViewPurchaseOrder from './ViewPurchaseOrder';
import { Box, Alert } from '@mui/material';

const ViewPurchaseOrderIndex = ({ orderId, initialData }) => {
  // Handle case where no data is provided
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
    />
  );
};

export default ViewPurchaseOrderIndex;