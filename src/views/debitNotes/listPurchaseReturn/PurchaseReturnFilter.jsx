'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';

const PurchaseReturnFilter = ({ open, onClose, onFilter, vendors, onReset }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      vendor: '',
      vendorSearch: null
    }
  });

  const handleFilter = (data) => {
    const selectedVendor = data.vendorSearch?.vendor_name || data.vendor;
    onFilter({ vendor: selectedVendor });
    onClose();
  };

  const handleReset = () => {
    reset();
    onReset();
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
          <Typography variant="h6">Vendors</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider className="mb-4" />

        <form onSubmit={handleSubmit(handleFilter)} className="flex flex-col gap-4 flex-1">
          <Controller
            name="vendorSearch"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                options={vendors}
                getOptionLabel={(option) => option.vendor_name || ''}
                value={value}
                onChange={(event, newValue) => {
                  onChange(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Vendor"
                    size="small"
                    fullWidth
                  />
                )}
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

export default PurchaseReturnFilter;