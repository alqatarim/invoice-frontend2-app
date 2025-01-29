'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, CircularProgress, Box, Typography } from '@mui/material';
import ViewPurchaseReturn from './ViewPurchaseReturn';
import { getDebitNoteDetails } from '@/app/(dashboard)/debitNotes/actions';

const ViewPurchaseReturnIndex = ({ debitNoteId }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [debitNoteData, setDebitNoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const debitNoteResponse = await getDebitNoteDetails(debitNoteId);

        if (!debitNoteResponse) {
          throw new Error('Failed to fetch debit note');
        }

        setDebitNoteData(debitNoteResponse);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !debitNoteData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error || 'Failed to load debit note data'}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewPurchaseReturn debitNoteData={debitNoteData} />

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

export default ViewPurchaseReturnIndex;