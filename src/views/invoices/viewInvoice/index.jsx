'use client';

import { Box, Container, Paper, CircularProgress } from '@mui/material';
import ViewInvoice from './ViewInvoice.jsx';
import { useEffect, useState } from 'react';
import { getInvoiceById } from '@/app/(dashboard)/invoices/actions';

export default function ViewInvoiceComponent({ id }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchInvoiceData = async (id) => {
         console.log('My view invoice Data: ');
    setLoading(true);
    try {
      const response = await getInvoiceById(id);
      console.log('My view invoice Data: ');
      console.log(response);
      setInvoiceData(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      setError(error.message || 'Failed to fetch invoice data');
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    if (id) {
      fetchInvoiceData(id);
    } else {
      console.warn('No id provided to fetch invoice data');
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
      <ViewInvoice
        invoiceData={invoiceData}
        isLoading={loading}
        refreshData={fetchInvoiceData}
      />
    </Box>
  );
}
