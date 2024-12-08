'use client';

import React, { useState, useEffect } from 'react';
import EditPurchase from './EditPurchase';
import { getPurchaseDetails, updatePurchase, getDropdownData } from '@/app/(dashboard)/purchases/actions';
import { Box, CircularProgress } from '@mui/material';

const EditPurchaseIndex = ({ purchaseId }) => {
  const [loading, setLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseResponse, dropdownResponse] = await Promise.all([
          getPurchaseDetails(purchaseId),
          getDropdownData()
        ]);

        if (purchaseResponse.success && dropdownResponse.success) {
          setPurchaseData(purchaseResponse.data);
          setDropdownData(dropdownResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [purchaseId]);

  const handleSave = async (data) => {
    const response = await updatePurchase(purchaseId, data);
    return response;
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (!purchaseData || !dropdownData) {
    return (
      <Box className="p-4">
        <div>Error loading purchase data</div>
      </Box>
    );
  }

  return (
    <EditPurchase
      initialData={purchaseData}
      dropdownData={dropdownData}
      onSave={handleSave}
    />
  );
};

export default EditPurchaseIndex;