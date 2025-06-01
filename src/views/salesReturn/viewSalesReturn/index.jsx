'use client';

import React, { useState, useEffect } from 'react';
import ViewSalesReturn from '@/views/salesReturn/viewSalesReturn/ViewSalesReturn';
import { getSalesReturnDetails } from '@/app/(dashboard)/sales-return/actions';
import { CircularProgress, Box } from '@mui/material';

const ViewSalesReturnIndex = ({ id }) => {
  const [salesReturnData, setSalesReturnData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesReturnData = async () => {
      try {
        const data = await getSalesReturnDetails(id);
        setSalesReturnData(data);
      } catch (error) {
        console.error('Error fetching sales return details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReturnData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <ViewSalesReturn salesReturnData={salesReturnData} loading={loading} />;
};

export default ViewSalesReturnIndex;