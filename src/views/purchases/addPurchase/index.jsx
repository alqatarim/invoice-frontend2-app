'use client';

import React, { useState } from 'react';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AddPurchase from '@/views/purchases/addPurchase/AddPurchase';
import { addPurchase } from '@/app/(dashboard)/purchases/actions';

const AddPurchaseIndex = ({ vendors, products, taxRates, banks, signatures, purchaseNumber }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (purchaseData, signatureURL) => {
    try {
      // Show loading state
      setSnackbar({
        open: true,
        message: 'Creating purchase...',
        severity: 'info'
      });

      const response = await addPurchase(purchaseData, signatureURL);

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
            message: response.message || 'Failed to create purchase',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase created successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to create purchase'
      };
    }
  };

  return (
    <>
      <AddPurchase
        onSave={handleSave}
        vendorsData={vendors}
        productData={products}
        taxRates={taxRates}
        initialBanks={banks}
        signatures={signatures}
        purchaseNumber={purchaseNumber}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
      />
    </>
  );
};

export default AddPurchaseIndex;