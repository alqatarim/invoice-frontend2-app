'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

const PurchaseFilter = ({ open, onClose, onFilter }) => {
  const [vendors, setVendors] = useState([]);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      dateFrom: null,
      dateTo: null,
      vendor: '',
      status: '',
      amountFrom: '',
      amountTo: ''
    }
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetchWithAuth('/drop_down/vendor');
        if (response.code === 200) {
          setVendors(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    if (open) {
      fetchVendors();
    }
  }, [open]);

  const handleFilter = (data) => {
    onFilter(1, 10, '', data); // Reset to first page when filtering
    onClose();
  };

  const handleReset = () => {
    reset();
    onFilter(1, 10);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 }
      }}
    >
      <Box className="p-4 h-full flex flex-col">
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">Filter Purchases</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider className="mb-4" />

        <form onSubmit={handleSubmit(handleFilter)} className="flex flex-col gap-4 flex-1">
          <Controller
            name="dateFrom"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date From"
                {...field}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            )}
          />

          <Controller
            name="dateTo"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date To"
                {...field}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            )}
          />

          <Controller
            name="vendor"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Vendor</InputLabel>
                <Select {...field} label="Vendor">
                  <MenuItem value="">All</MenuItem>
                  {vendors.map(vendor => (
                    <MenuItem key={vendor._id} value={vendor._id}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="amountFrom"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Amount From"
                type="number"
                fullWidth
                size="small"
              />
            )}
          />

          <Controller
            name="amountTo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Amount To"
                type="number"
                fullWidth
                size="small"
              />
            )}
          />

          <Box className="mt-auto">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              className="mb-2"
            >
              Apply Filter
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default PurchaseFilter;