'use client';

import React, { useState, useEffect } from 'react';
import { getPurchaseOrderDetails } from '@/app/(dashboard)/purchase-orders/actions';
import ViewPurchaseOrder from './ViewPurchaseOrder';
import { Box, CircularProgress, Alert } from '@mui/material';

const ViewPurchaseOrderIndex = ({ orderId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPurchaseOrderDetails(orderId);
        if (response.success) {
          setOrderData(response.data);
        } else {
          setError(response.message || 'Failed to load purchase order details');
        }
      } catch (error) {
        console.error('Error fetching purchase order:', error);
        setError('An error occurred while loading the purchase order');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!orderData) {
    return (
      <Box className="p-4">
        <Alert severity="warning">No purchase order data found</Alert>
      </Box>
    );
  }

  return <ViewPurchaseOrder data={orderData} />;
};

export default ViewPurchaseOrderIndex;