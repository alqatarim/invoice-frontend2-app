'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton, Box } from '@mui/material';
import AddDebitNote from '@/views/debitNotes/addPurchaseReturn/AddDebitNote';
import { getDropdownData } from '@/app/(dashboard)/debitNotes/actions';
import { usePurchaseReturnAddHandlers } from '@/handlers/purchaseReturn/add/usePurchaseReturnAddHandlers';

function AddPurchaseReturnIndex() {
  const [dropdownData, setDropdownData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize handlers with dropdown data
  const handlers = usePurchaseReturnAddHandlers(dropdownData);

  // Fetch dropdown data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDropdownData();
        setDropdownData(data);
      } catch (error) {
        console.error('Error loading form data:', error);
        setError('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate debit note number after handlers are available
  useEffect(() => {
    if (!isLoading && handlers.generateDebitNoteNumber) {
      handlers.generateDebitNoteNumber();
    }
  }, [isLoading, handlers.generateDebitNoteNumber]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>{error}</div>
      </Box>
    );
  }

  return (
    <AddDebitNote
      vendorsData={dropdownData.vendors}
      productData={dropdownData.products}
      taxRates={dropdownData.taxRates}
      initialBanks={dropdownData.banks}
      signatures={dropdownData.signatures}
      debitNoteNumber="DN-001"
    />
  );
}

export default AddPurchaseReturnIndex;