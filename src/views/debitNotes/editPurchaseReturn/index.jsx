'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton, Box } from '@mui/material';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';
import { getDropdownData } from '@/app/(dashboard)/debitNotes/actions';
import { usePurchaseReturnEditHandlers } from '@/handlers/purchaseReturn/edit/usePurchaseReturnEditHandlers';

function EditPurchaseReturnIndex({ id }) {
  const [dropdownData, setDropdownData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize handlers with dropdown data and ID
  const handlers = usePurchaseReturnEditHandlers({
    debitNoteId: id,
    ...dropdownData
  });

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

  if (isLoading || handlers.isLoading) {
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
    <EditPurchaseReturn handlers={handlers} />
  );
}

export default EditPurchaseReturnIndex;