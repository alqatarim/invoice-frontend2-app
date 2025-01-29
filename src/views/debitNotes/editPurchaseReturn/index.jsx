'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, CircularProgress, Box, Typography } from '@mui/material';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';
import {
  updateDebitNote,
  getDebitNoteDetails,
  getDropdownData
} from '@/app/(dashboard)/debitNotes/actions';

const EditPurchaseReturnIndex = ({ debitNoteId }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [debitNoteData, setDebitNoteData] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both debit note details and dropdown data in parallel
        const [debitNoteResponse, dropdownResponse] = await Promise.all([
          getDebitNoteDetails(debitNoteId),
          getDropdownData()
        ]);

        if (!debitNoteResponse) {
          throw new Error('Failed to fetch debit note');
        }

        setDebitNoteData(debitNoteResponse);
        setDropdownData(dropdownResponse);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'An unexpected error occurred');
        setSnackbar({
          open: true,
          message: error.message || 'An unexpected error occurred',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (debitNoteId) {
      fetchData();
    }
  }, [debitNoteId]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (debitNoteData, signatureURL) => {
    try {
      setSnackbar({
        open: true,
        message: 'Updating purchase return...',
        severity: 'info'
      });

      const response = await updateDebitNote(debitNoteId, debitNoteData, signatureURL);

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
            message: response.message || 'Failed to update purchase return',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase return updated successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase return:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to update purchase return'
      };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !debitNoteData || !dropdownData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error || 'Failed to load required data'}</Typography>
      </Box>
    );
  }

  return (
    <>
      <EditPurchaseReturn
        debitNoteData={debitNoteData}
        onSave={handleSave}
        vendors={dropdownData.vendors}
        products={dropdownData.products}
        taxRates={dropdownData.taxRates}
        banks={dropdownData.banks}
        signatures={dropdownData.signatures}
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

export default EditPurchaseReturnIndex;