'use client';

import React, { useState, useEffect } from 'react';
import EditPurchaseOrder from './EditPurchaseOrder';
import { getPurchaseOrderDetails, updatePurchaseOrder, getDropdownData } from '@/app/(dashboard)/purchase-orders/actions';
import { Box, CircularProgress } from '@mui/material';

const EditPurchaseOrderIndex = ({ orderId }) => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderResponse, dropdownResponse] = await Promise.all([
          getPurchaseOrderDetails(orderId),
          getDropdownData()
        ]);

        if (orderResponse.success && dropdownResponse.success) {
          setOrderData(orderResponse.data);
          setDropdownData(dropdownResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleSave = async (data) => {
    const response = await updatePurchaseOrder(orderId, data);
    return response;
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (!orderData || !dropdownData) {
    return (
      <Box className="p-4">
        <div>Error loading purchase order data</div>
      </Box>
    );
  }

  return (
    <EditPurchaseOrder
      initialData={orderData}
      dropdownData={dropdownData}
      onSave={handleSave}
    />
  );
};

export default EditPurchaseOrderIndex;