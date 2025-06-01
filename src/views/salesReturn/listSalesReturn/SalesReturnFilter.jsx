'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const SalesReturnFilter = ({ open, onClose, onFilter, customers }) => {
  const [filters, setFilters] = useState({
    salesReturnId: '',
    customerId: '',
    fromDate: null,
    toDate: null,
    status: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    // Only send non-empty filter values
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        if (key === 'fromDate' || key === 'toDate') {
          acc[key] = value ? dayjs(value).format('YYYY-MM-DD') : null;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    onFilter(activeFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      salesReturnId: '',
      customerId: '',
      fromDate: null,
      toDate: null,
      status: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Filter Sales Returns
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            fullWidth
            label="Sales Return ID"
            value={filters.salesReturnId}
            onChange={(e) => handleFilterChange('salesReturnId', e.target.value)}
            placeholder="Enter sales return ID"
          />

          <FormControl fullWidth>
            <InputLabel>Customer</InputLabel>
            <Select
              value={filters.customerId}
              label="Customer"
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="From Date"
            value={filters.fromDate}
            onChange={(value) => handleFilterChange('fromDate', value)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DatePicker
            label="To Date"
            value={filters.toDate}
            onChange={(value) => handleFilterChange('toDate', value)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApplyFilter} variant="contained" color="primary">
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalesReturnFilter;