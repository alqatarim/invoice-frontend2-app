'use client';

import { Box, Container, Paper } from '@mui/material';
import ViewInvoice from './ViewInvoice.jsx';
import { useEffect, useState } from 'react';
import { getInvoiceById } from '@/app/(dashboard)/invoices/actions';

export default function ViewInvoiceComponent({ id, initialInvoiceData = null }) {
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const [loading, setLoading] = useState(!initialInvoiceData);
  const [error, setError] = useState(null);


  const fetchInvoiceData = async (id) => {
    setLoading(true);
    try {
      const response = await getInvoiceById(id);
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
    if (!initialInvoiceData && id) {
      fetchInvoiceData(id);
    }
  }, [id, initialInvoiceData]);

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
