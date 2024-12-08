'use client';

import React, { useState, useEffect } from 'react';
import { getPurchaseOrderDetails } from '@/app/(dashboard)/purchase-orders/actions';
import ViewPurchaseOrder from './ViewPurchaseOrder';
import { Box, CircularProgress } from '@mui/material';

const ViewPurchaseOrderIndex = ({ orderId }) => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPurchaseOrderDetails(orderId);
        if (response.success) {
          setOrderData(response.data);
        }
      } catch (error) {
        console.error('Error fetching purchase order:', error);
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

  if (!orderData) {
    return (
      <Box className="p-4">
        <div>Error loading purchase order data</div>
      </Box>
    );
  }

  return <ViewPurchaseOrder data={orderData} />;
};

export default ViewPurchaseOrderIndex;