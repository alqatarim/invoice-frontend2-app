'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Snackbar,
  Alert,

} from '@mui/material';
import moment from 'moment';
import { addPayment } from '@/app/(dashboard)/invoices/actions';

import InvoiceView from './InvoiceView'; // Adjust the path if necessary
import InvoiceActions from './InvoiceActions'; // Adjust the path if necessary


const ViewInvoice = ({ initialInvoiceData }) => {

  // const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  // const [items, setItems] = useState([]);
  // const [dueDays, setDueDays] = useState(0);
  // const [companyData, setCompanyData] = useState(null);


  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [invoiceData, setInvoiceData] = useState(null);


  useEffect(() => {
    if (initialInvoiceData) {
      setInvoiceData(initialInvoiceData.invoice_details);

    }
  }, [initialInvoiceData]);

  // useEffect(() => {
  //   if (invoiceData?.dueDate) {
  //     const calculateDaysRemaining = () => {
  //       const currentDate = moment();
  //       const dueDateTime = moment(invoiceData.dueDate);
  //       const diffInDays = dueDateTime.diff(currentDate, 'days');
  //       setDueDays(diffInDays);
  //     };
  //     calculateDaysRemaining();
  //   }
  // }, [invoiceData]);

  const handleOpenAddPayment = () => {
    setAddPaymentOpen(true);
  };

  const handleCloseAddPayment = () => {
    setAddPaymentOpen(false);
  };

  const handleAddPayment = async (paymentData) => {
    try {
      const response = await addPayment(paymentData);
      if (response.code === 200) {
        setSnackbar({
          open: true,
          message: 'Payment added successfully.',
          severity: 'success',
        });
        // Optionally, refresh invoice data or update state
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to add payment.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred.',
        severity: 'error',
      });
    } finally {
      handleCloseAddPayment();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!invoiceData) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6">Loading Invoice...</Typography>
      </Box>
    );
  }

  const handleImageError = (event) => {
    event.target.src = '/default/logo.png'; // Provide a default logo path
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>


      {/* Refactored Preview Sections */}
      <Grid container spacing={6}>
        <Grid item xs={12} md={9}>
          <InvoiceView invoiceData={invoiceData} id={invoiceData?.invoiceNumber} />
        </Grid>
        <Grid item xs={12} md={3}>
          <InvoiceActions
            id={invoiceData?._id}
            onButtonClick={() => window.print()}
          />
        </Grid>
      </Grid>






      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewInvoice;
