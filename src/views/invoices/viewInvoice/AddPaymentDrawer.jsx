'use client'

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

const AddPaymentDrawer = ({ open, handleClose, invoiceId }) => {
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleSubmit = () => {
    // Implement payment submission logic here
    console.log(`Submitting payment of $${paymentAmount} for Invoice ID: ${invoiceId}`);
    handleClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box sx={{ width: 350, p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Payment
        </Typography>
        <TextField
          label="Payment Amount"
          type="number"
          fullWidth
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          Submit Payment
        </Button>
      </Box>
    </Drawer>
  );
};

export default AddPaymentDrawer;
