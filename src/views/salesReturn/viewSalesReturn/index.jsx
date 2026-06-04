'use client';

import React, { useState, useEffect } from 'react';
import ViewSalesReturn from '@/views/salesReturn/viewSalesReturn/ViewSalesReturn';
import { getSalesReturnDetails } from '@/app/(dashboard)/sales-return/actions';
import { CircularProgress, Box } from '@mui/material';

const ViewSalesReturnIndex = ({ id, initialSalesReturnData = null, initialErrorMessage = '' }) => {
  const [salesReturnData, setSalesReturnData] = useState(initialSalesReturnData);
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);
  const [loading, setLoading] = useState(!initialSalesReturnData && !initialErrorMessage);

  useEffect(() => {
    if (initialSalesReturnData || initialErrorMessage) {
      return;
    }

    const fetchSalesReturnData = async () => {
      try {
        const data = await getSalesReturnDetails(id);
        setSalesReturnData(data);
      } catch (error) {
        console.error('Error fetching sales return details:', error);
        setErrorMessage(error?.message || 'Failed to load sales return data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReturnData();
  }, [id, initialSalesReturnData, initialErrorMessage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage || !salesReturnData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>{errorMessage || 'Failed to load sales return data.'}</div>
      </Box>
    );
  }

  return <ViewSalesReturn salesReturnData={salesReturnData} loading={loading} />;
};

export default ViewSalesReturnIndex;