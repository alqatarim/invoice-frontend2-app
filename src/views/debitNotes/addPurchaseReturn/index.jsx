'use client';

import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import AddPurchaseReturn from './AddPurchaseReturn';
import { addDebitNote } from '@/app/(dashboard)/debitNotes/actions';

const AddPurchaseReturnIndex = ({ vendors, products, taxRates, banks, signatures, debitNoteNumber }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (debitNoteData, signatureURL) => {
    try {
      // Show loading state
      setSnackbar({
        open: true,
        message: 'Creating purchase return...',
        severity: 'info'
      });

      const response = await addDebitNote(debitNoteData, signatureURL);

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
            message: response.message || 'Failed to create purchase return',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase return created successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase return:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to create purchase return'
      };
    }
  };

  return (
    <>
      <AddPurchaseReturn
        onSave={handleSave}
        vendors={vendors}
        products={products}
        taxRates={taxRates}
        banks={banks}
        signatures={signatures}
        debitNoteNumber={debitNoteNumber}
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

export default AddPurchaseReturnIndex;