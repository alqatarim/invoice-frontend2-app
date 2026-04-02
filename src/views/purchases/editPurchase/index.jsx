'use client';

import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import AppSnackbar from '@/components/shared/AppSnackbar';
import EditPurchase from '@/views/purchases/editPurchase/EditPurchase';
import { updatePurchase } from '@/app/(dashboard)/purchases/actions';



const EditPurchaseIndex = ({
  initialPurchaseData = null,
  initialVendors = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialUnits = [],
  initialErrorMessage = ''
}) => {
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'info'
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (purchaseData, signatureURL) => {
    try {
      setSnackbar({
        open: true,
        message: 'Updating purchase...',
        severity: 'info'
      });

      const response = await updatePurchase(purchaseData._id, purchaseData, signatureURL);

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
            message: response.message || 'Failed to update purchase',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase updated successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to update purchase'
      };
    }
  };




  return (
    <>
      <EditPurchase
        vendorsData={initialVendors}
        productData={initialProducts}
        taxRates={initialTaxRates}
        initialBanks={initialBanks}
        signatures={initialSignatures}
        purchaseData={initialPurchaseData}
        onSave={handleSave}
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

export default EditPurchaseIndex;
