'use client';

import React from 'react';
import { Box } from '@mui/material';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';

function EditPurchaseReturnIndex({
  id,
  initialDropdownData = {},
  initialDebitNoteData = null,
}) {
  const dropdownData = {
    vendors: initialDropdownData?.vendors || [],
    products: initialDropdownData?.products || [],
    taxRates: initialDropdownData?.taxRates || [],
    banks: initialDropdownData?.banks || [],
    signatures: initialDropdownData?.signatures || [],
  };

  if (!initialDebitNoteData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>Failed to load debit note data</div>
        <div>ID: {id}</div>
        <div>Debit Note Data: Not available</div>
      </Box>
    );
  }

  return (
    <EditPurchaseReturn
      debitNoteData={initialDebitNoteData}
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