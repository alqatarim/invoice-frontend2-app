'use client';

import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import AddPurchaseOrder from '@/views/purchase-orders/addOrder/AddPurchaseOrder';
import { addPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderIndex = ({ vendors, products, taxRates, banks, signatures, purchaseOrderNumber }) => {
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
      // Show loading state
      setSnackbar({
        open: true,
        message: 'Creating purchase order...',
        severity: 'info'
      });

      const response = await addPurchaseOrder(orderData, signatureURL);

      if (!response.success) {
        // Handle validation errors from the server
        if (response.errors && Array.isArray(response.errors)) {
          setSnackbar({
            open: true,
            message: response.errors.join('\n'),
            severity: 'error'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to create purchase order',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase order created successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to create purchase order'
      };
    }
  };

  return (
    <>
      <AddPurchaseOrder
        onSave={handleSave}
        vendors={vendors}
        products={products}
        taxRates={taxRates}
        banks={banks}
        signatures={signatures}
        purchaseOrderNumber={purchaseOrderNumber}
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

export default AddPurchaseOrderIndex;