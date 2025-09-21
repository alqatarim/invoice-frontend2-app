'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, CircularProgress, Box, Typography } from '@mui/material';
import EditPurchaseOrder from '@/views/purchase-orders/editOrder/EditPurchaseOrder';
import { updatePurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';



const EditPurchaseOrderIndex = ({ orderId, purchaseOrderData, vendorsData, productData, taxRates, initialBanks, signatures }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (orderData, signatureURL) => {
    try {
      setSnackbar({
        open: true,
        message: 'Updating purchase order...',
        severity: 'info'
      });

      const response = await updatePurchaseOrder(orderId, orderData, signatureURL);

      if (!response.success) {
        if (response.errors && Array.isArray(response.errors)) {
          setSnackbar({
            open: true,
            message: response.errors.join('\n'),
            severity: 'error'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to update purchase order',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase order updated successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to update purchase order'
      };
    }
  };




  return (
    <>
      <EditPurchaseOrder
        purchaseOrderData={purchaseOrderData}
        onSave={handleSave}
        vendorsData={vendorsData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
      />

      <Snackbar
        className='size-sm'
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditPurchaseOrderIndex;