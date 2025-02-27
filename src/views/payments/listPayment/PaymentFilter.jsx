'use client';

import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Drawer,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { searchCustomers } from '@/app/(dashboard)/payments/actions';
import { debounce } from '@/utils/debounce';

const PaymentFilter = ({
  show,
  setShow,
  setPayments,
  page,
  pageSize,
  setTotalRecords,
  setPage,
  onFilter,
  getPaymentsList,
  selectedCustomers,
  setSelectedCustomers,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchCustomers = async (value) => {
    if (!value) {
      setCustomerResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchCustomers(value);
      if (response.success) {
        setCustomerResults(response.data);
        setNoResults(response.data.length === 0);
      } else {
        setCustomerResults([]);
        setNoResults(true);
        enqueueSnackbar('Error searching customers', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce(handleSearchCustomers, 300);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(customerId)) {
        return prev.filter((id) => id !== customerId);
      }
      return [...prev, customerId];
    });
  };

  const handleApplyFilter = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      const response = await getPaymentsList(1, pageSize, {
        customer: selectedCustomers
      });

      if (response.success) {
        setPayments(response.data);
        setTotalRecords(response.totalRecords);
        setShow(false);
        onFilter?.(true);
        setPage(1);
      } else {
        enqueueSnackbar('Error applying filter', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      enqueueSnackbar('Error applying filter', { variant: 'error' });
    }
  };

  const handleClearFilter = async () => {
    setSelectedCustomers([]);
    setSearchText('');
    setCustomerResults([]);
    setNoResults(false);
    setPage(1);
    onFilter?.(false);

    try {
      const response = await getPaymentsList(1, pageSize);
      if (response && response.success) {
        setPayments(response.data);
        setTotalRecords(response.totalRecords);
        setShow(false);
      }
    } catch (error) {
      console.error('Error clearing filter:', error);
      enqueueSnackbar('Error clearing filter', { variant: 'error' });
    }
  };

  return (
    <Drawer
      anchor='right'
      open={show}
      onClose={() => setShow(false)}
      PaperProps={{
        sx: { width: 380 }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h6'>Filter</Typography>
          <IconButton onClick={() => setShow(false)}>
            <Icon icon='tabler:x' fontSize={20} />
          </IconButton>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant='subtitle1' sx={{ mb: 2 }}>
            Customer
          </Typography>
          <TextField
            fullWidth
            size='small'
            value={searchText}
            onChange={handleSearchChange}
            placeholder='Search Customers'
            InputProps={{
              startAdornment: <Icon icon='tabler:search' fontSize={20} />
            }}
          />

          <Box sx={{ mt: 4 }}>
            {customerResults.map((customer) => (
              <FormControlLabel
                key={customer._id}
                control={
                  <Checkbox
                    checked={selectedCustomers.includes(customer._id)}
                    onChange={() => handleCustomerSelect(customer._id)}
                  />
                }
                label={customer.name}
              />
            ))}
            {noResults && (
              <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
                No customers found
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 8 }}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleApplyFilter}
            disabled={selectedCustomers.length === 0}
          >
            Apply Filter
          </Button>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleClearFilter}
            disabled={selectedCustomers.length === 0 && searchText === ''}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PaymentFilter;
