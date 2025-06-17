'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton, Box } from '@mui/material';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';
import { getDropdownData, getDebitNoteDetails } from '@/app/(dashboard)/debitNotes/actions';

function EditPurchaseReturnIndex({ id }) {
  const [dropdownData, setDropdownData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: []
  });
  const [debitNoteData, setDebitNoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dropdown data and debit note data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError('No debit note ID provided');
          setIsLoading(false);
          return;
        }

        // Fetch both dropdown data and debit note data in parallel
        const [dropdownResponse, debitNoteResponse] = await Promise.all([
          getDropdownData(),
          getDebitNoteDetails(id)
        ]);

        setDropdownData(dropdownResponse);

        if (debitNoteResponse?.success && debitNoteResponse?.data) {
          setDebitNoteData(debitNoteResponse.data);
        } else {
          setError('Failed to load debit note data');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (error || !debitNoteData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>{error || 'Failed to load debit note data'}</div>
        <div>ID: {id}</div>
        <div>Debit Note Data: {debitNoteData ? 'Available' : 'Not available'}</div>
      </Box>
    );
  }

  return (
    <EditPurchaseReturn
      debitNoteData={debitNoteData}
      vendorsData={dropdownData.vendors || []}
      productData={dropdownData.products || []}
      taxRates={dropdownData.taxRates || []}
      initialBanks={dropdownData.banks || []}
      signatures={dropdownData.signatures || []}
      onSave={(data) => {
        console.log('Saving debit note:', data);
        // Add actual save logic here
      }}
      enqueueSnackbar={(message, options) => {
        console.log('Snackbar:', message, options);
        // Add actual snackbar logic here
      }}
      closeSnackbar={() => {
        console.log('Close snackbar');
        // Add actual close snackbar logic here
      }}
    />
  );
}

export default EditPurchaseReturnIndex;