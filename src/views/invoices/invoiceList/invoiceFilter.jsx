// app/invoices/components/InvoiceFilter.jsx

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Typography,
  FormGroup,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  searchCustomers,
  searchInvoices,
} from '@/app/(dashboard)/invoices/actions';

const statusOptions = [
  { id: 'PAID', label: 'PAID' },
  { id: 'OVERDUE', label: 'OVERDUE' },
  { id: 'PARTIALLY_PAID', label: 'PARTIALLY PAID' },
  { id: 'DRAFTED', label: 'DRAFTED' },
  { id: 'SENT', label: 'SENT' },
];

const InvoiceFilter = ({ filters, onFilterChange, open, onClose }) => {
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState(
    filters.customer || []
  );

  const [invoiceSearchText, setInvoiceSearchText] = useState('');
  const [invoiceSearchResults, setInvoiceSearchResults] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState(
    filters.invoiceNumber || []
  );

  const [fromDate, setFromDate] = useState(filters.fromDate || '');
  const [toDate, setToDate] = useState(filters.toDate || '');

  const [selectedStatuses, setSelectedStatuses] = useState(
    filters.status || []
  );

  // Sync internal state with props
  useEffect(() => {
    setSelectedCustomers(filters.customer || []);
    setSelectedInvoices(filters.invoiceNumber || []);
    setFromDate(filters.fromDate || '');
    setToDate(filters.toDate || '');
    setSelectedStatuses(filters.status || []);
  }, [filters]);

  const handleCustomerSearch = async (e) => {
    const searchTerm = e.target.value;
    setCustomerSearchText(searchTerm);
    if (searchTerm.length > 0) {
      try {
        const response = await searchCustomers(searchTerm);
        setCustomerSearchResults(response.customers || []);
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomerSearchResults([]);
      }
    } else {
      setCustomerSearchResults([]);
    }
  };

  const handleInvoiceSearch = async (e) => {
    const searchTerm = e.target.value;
    setInvoiceSearchText(searchTerm);
    if (searchTerm.length > 0) {
      try {
        const response = await searchInvoices(searchTerm);
        setInvoiceSearchResults(response.invoiceList || []);
      } catch (error) {
        console.error('Error searching invoices:', error);
        setInvoiceSearchResults([]);
      }
    } else {
      setInvoiceSearchResults([]);
    }
  };

  const handleApply = () => {
    const newFilters = {
      customer: selectedCustomers,
      invoiceNumber: selectedInvoices,
      fromDate,
      toDate,
      status: selectedStatuses,
    };
    onFilterChange(newFilters);
    onClose();
  };

  const handleReset = () => {
    setCustomerSearchText('');
    setCustomerSearchResults([]);
    setSelectedCustomers([]);
    setInvoiceSearchText('');
    setInvoiceSearchResults([]);
    setSelectedInvoices([]);
    setFromDate('');
    setToDate('');
    setSelectedStatuses([]);
    onFilterChange({});
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '80vw', sm: '300px' }, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter Invoices
        </Typography>
        <List>
          {/* Customer Filter */}
          <ListItem>
            <ListItemText primary="Customer" />
          </ListItem>
          <TextField
            placeholder="Search Customer"
            value={customerSearchText}
            onChange={handleCustomerSearch}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
            {Array.isArray(customerSearchResults) && customerSearchResults.map((customer) => (
              <FormControlLabel
                key={customer._id}
                control={
                  <Checkbox
                    checked={selectedCustomers.includes(customer._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers([
                          ...selectedCustomers,
                          customer._id,
                        ]);
                      } else {
                        setSelectedCustomers(
                          selectedCustomers.filter((id) => id !== customer._id)
                        );
                      }
                    }}
                  />
                }
                label={customer.name}
              />
            ))}
          </Box>
          <Divider />

          {/* Invoice Number Filter */}
          <ListItem>
            <ListItemText primary="Invoice Number" />
          </ListItem>
          <TextField
            placeholder="Search Invoice Number"
            value={invoiceSearchText}
            onChange={handleInvoiceSearch}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
            {Array.isArray(invoiceSearchResults) && invoiceSearchResults.map((invoice) => (
              <FormControlLabel
                key={invoice._id}
                control={
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.invoiceNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoices([
                          ...selectedInvoices,
                          invoice.invoiceNumber,
                        ]);
                      } else {
                        setSelectedInvoices(
                          selectedInvoices.filter(
                            (num) => num !== invoice.invoiceNumber
                          )
                        );
                      }
                    }}
                  />
                }
                label={invoice.invoiceNumber}
              />
            ))}
          </Box>
          <Divider />

          {/* Date Range Filter */}
          <ListItem>
            <ListItemText primary="Select Date" />
          </ListItem>
          <TextField
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
          />
          <TextField
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
          />
          <Divider />

          {/* Status Filter */}
          <ListItem>
            <ListItemText primary="By Status" />
          </ListItem>
          <FormGroup>
            {statusOptions.map((status) => (
              <FormControlLabel
                key={status.id}
                control={
                  <Checkbox
                    checked={selectedStatuses.includes(status.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatuses([
                          ...selectedStatuses,
                          status.id,
                        ]);
                      } else {
                        setSelectedStatuses(
                          selectedStatuses.filter((s) => s !== status.id)
                        );
                      }
                    }}
                  />
                }
                label={status.label}
              />
            ))}
          </FormGroup>
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
export default InvoiceFilter;
