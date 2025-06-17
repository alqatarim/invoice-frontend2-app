'use client';

import { Box, Container, Paper } from '@mui/material';
import ViewDeliveryChallan from './ViewDeliveryChallan.jsx';
import { useEffect, useState } from 'react';
import { getDeliveryChallanById } from '@/app/(dashboard)/deliveryChallans/actions';

export default function ViewDeliveryChallanComponent({ id }) {
  const [deliveryChallanData, setDeliveryChallanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveryChallanData = async (id) => {
    setLoading(true);
    try {
      const response = await getDeliveryChallanById(id);
      setDeliveryChallanData(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching delivery challan data:', error);
      setError(error.message || 'Failed to fetch delivery challan data');
      setDeliveryChallanData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeliveryChallanData(id);
    } else {
      console.warn('No id provided to fetch delivery challan data');
    }
  }, [id]);

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <ViewDeliveryChallan
        deliveryChallanData={deliveryChallanData}
        isLoading={loading}
        refreshData={fetchDeliveryChallanData}
      />
    </Box>
  );
}