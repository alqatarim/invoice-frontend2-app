'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { getExpensesList } from '@/app/(dashboard)/expenses/actions';
import { useSnackbar } from 'notistack';

const ExpenseFilter = ({
  show,
  setShow,
  setExpenses,
  page,
  pageSize,
  setTotalCount,
  setPage,
  handlePagination,
  enqueueSnackbar,
  closeSnackbar
}) => {
  const [status, setStatus] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [expenseId, setExpenseId] = useState('');

  const handleFilter = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', pageSize);
      queryParams.append('skip', (page - 1) * pageSize);

      if (status) queryParams.append('status', status);
      if (paymentMode) queryParams.append('paymentMode', paymentMode);
      if (expenseId) queryParams.append('expenseId', expenseId);

      const response = await getExpensesList(page, pageSize, queryParams.toString());
      if (response.success) {
        setExpenses(response.data);
        setTotalCount(response.totalRecords);
        setShow(false);
      } else {
        enqueueSnackbar(response.message || 'Error applying filters', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Error applying filters', { variant: 'error' });
    }
  };

  const handleReset = () => {
    setStatus('');
    setPaymentMode('');
    setExpenseId('');
    handlePagination(1, pageSize);
    setShow(false);
  };

  return (
    <Drawer
      anchor="right"
      open={show}
      onClose={() => setShow(false)}
      PaperProps={{
        sx: { width: 400 }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Typography variant="h6">Filter</Typography>
          <IconButton onClick={() => setShow(false)}>
            <Icon icon="mdi:close" />
          </IconButton>
        </Box>

        <Box sx={{ mb: 6 }}>
          <TextField
            fullWidth
            label="Expense ID"
            value={expenseId}
            onChange={(e) => setExpenseId(e.target.value)}
            sx={{ mb: 4 }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={paymentMode}
              label="Payment Mode"
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            color="secondary"
            variant="outlined"
            onClick={handleReset}
            startIcon={<Icon icon="mdi:refresh" />}
          >
            Reset
          </Button>
          <Button
            fullWidth
            color="primary"
            variant="contained"
            onClick={handleFilter}
            startIcon={<Icon icon="mdi:filter" />}
          >
            Apply Filter
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ExpenseFilter;
