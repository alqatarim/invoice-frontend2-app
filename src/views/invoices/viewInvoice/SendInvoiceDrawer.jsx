'use client'

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

const SendInvoiceDrawer = ({ open, handleClose, invoiceId }) => {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // Implement send invoice logic here
    console.log(`Sending Invoice ID: ${invoiceId} to Email: ${email}`);
    handleClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box sx={{ width: 350, p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Send Invoice
        </Typography>
        <TextField
          label="Recipient Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Drawer>
  );
};

export default SendInvoiceDrawer;
