'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme, alpha } from '@mui/material/styles';

const PaymentFilter = ({
  open,
  onClose,
  filterValues,
  onFilterChange,
  onApply,
  onReset,
  customerOptions,
  customerSearchLoading,
  onCustomerSearch,
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    onFilterChange('search_customer', value);
    onCustomerSearch(value);
  };

  const handleCustomerToggle = (customerId) => {
    const currentCustomers = filterValues.customer || [];
    const isSelected = currentCustomers.includes(customerId);
    
    const newCustomers = isSelected
      ? currentCustomers.filter(id => id !== customerId)
      : [...currentCustomers, customerId];
    
    onFilterChange('customer', newCustomers);
  };

  const handleStatusChange = (event) => {
    onFilterChange('status', event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    onFilterChange('payment_method', event.target.value);
  };

  const handleApply = () => {
    onApply();
  };

  const handleClear = () => {
    setSearchText('');
    onReset();
  };

  const selectedCustomerIds = filterValues.customer || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" color="primary">
          Filter Payments
        </Typography>
        <IconButton onClick={onClose}>
          <Icon icon="mdi:close" />
        </IconButton>
      </Box>

      {/* Customer Search */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter by Customer
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Search customers..."
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Icon icon="mdi:magnify" />,
            endAdornment: customerSearchLoading && <CircularProgress size={20} />,
          }}
          sx={{ mb: 2 }}
        />

        {/* Customer Results */}
        {customerOptions.length > 0 && (
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {customerOptions.map((customer) => (
              <ListItem key={customer.value} dense>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedCustomerIds.includes(customer.value)}
                      onChange={() => handleCustomerToggle(customer.value)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={customer.customer?.image}
                        sx={{ width: 24, height: 24 }}
                      >
                        {customer.label && customer.label.length > 0 ? customer.label.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{customer.label || 'Unknown Customer'}</Typography>
                        {customer.customer?.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {customer.customer.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {searchText && !customerSearchLoading && customerOptions.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No customers found
          </Typography>
        )}
      </Box>

      {/* Status Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={filterValues.status || ''}
            onChange={handleStatusChange}
            label="Payment Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Success">Success</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Payment Method Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={filterValues.payment_method || ''}
            onChange={handlePaymentMethodChange}
            label="Payment Method"
          >
            <MenuItem value="">All Methods</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Cheque">Cheque</MenuItem>
            <MenuItem value="Bank">Bank</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleClear}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          disabled={selectedCustomerIds.length === 0}
        >
          Apply Filter
        </Button>
      </Box>
    </Drawer>
  );
};

export default PaymentFilter;