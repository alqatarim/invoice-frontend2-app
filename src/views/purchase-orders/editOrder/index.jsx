'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, CircularProgress, Box, Typography } from '@mui/material';
import EditPurchaseOrder from '@/views/purchase-orders/editOrder/EditPurchaseOrder';
import {
  updatePurchaseOrder,
  getPurchaseOrderDetails,
  getDropdownData
} from '@/app/(dashboard)/purchase-orders/actions';

const EditPurchaseOrderIndex = ({ orderId }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [orderData, setOrderData] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both order details and dropdown data in parallel
        const [orderResponse, dropdownResponse] = await Promise.all([
          getPurchaseOrderDetails(orderId),
          getDropdownData()
        ]);

        if (!orderResponse.success) {
          throw new Error(orderResponse.message || 'Failed to fetch purchase order');
        }

        if (!dropdownResponse.success) {
          throw new Error(dropdownResponse.message || 'Failed to fetch dropdown data');
        }

        setOrderData(orderResponse.data);
        setDropdownData(dropdownResponse.data);

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

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async (orderData, signatureURL) => {
    try {
      setSnackbar({
        open: true,
        message: 'Updating purchase order...',
        severity: 'info'
      });

      const response = await updatePurchaseOrder(orderId, orderData, signatureURL);

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
            message: response.message || 'Failed to update purchase order',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Purchase order updated successfully!',
          severity: 'success'
        });
      }

      return response;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
      return {
        success: false,
        message: error.message || 'Failed to update purchase order'
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

  if (error || !orderData || !dropdownData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error || 'Failed to load required data'}</Typography>
      </Box>
    );
  }

  return (
    <>
      <EditPurchaseOrder
        orderData={orderData}
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

export default EditPurchaseOrderIndex;