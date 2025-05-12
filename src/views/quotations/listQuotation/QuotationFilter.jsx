'use client';

import { useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';

const statusOptions = [
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Drafted', value: 'DRAFTED' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Rejected', value: 'REJECTED' }
];

const QuotationFilter = ({ onFilterChange, customers }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const handleToggleFilter = () => {
    setOpen(!open);
  };

  const handleCustomerChange = (event) => {
    const {
      target: { value }
    } = event;
    setSelectedCustomers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStatusChange = (event) => {
    const {
      target: { value }
    } = event;
    setSelectedStatuses(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDateRangeChange = (type, newValue) => {
    setDateRange({
      ...dateRange,
      [type]: newValue
    });
  };

  const applyFilters = () => {
    const filters = {
      customer: selectedCustomers,
      status: selectedStatuses,
      fromDate: dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD') : '',
      toDate: dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD') : ''
    };

    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedCustomers([]);
    setSelectedStatuses([]);
    setDateRange({
      startDate: null,
      endDate: null
    });

    // Apply empty filters to reset the list
    onFilterChange({
      customer: [],
      status: [],
      fromDate: '',
      toDate: ''
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 5,
        border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        borderRadius: '16px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          cursor: 'pointer'
        }}
        onClick={handleToggleFilter}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon="tabler:filter" fontSize={20} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>

          {(selectedCustomers.length > 0 || selectedStatuses.length > 0 || dateRange.startDate || dateRange.endDate) && (
            <Chip
              size="small"
              label={`${selectedCustomers.length + selectedStatuses.length + (dateRange.startDate ? 1 : 0) + (dateRange.endDate ? 1 : 0)} active`}
              color="primary"
              variant="tonal"
              sx={{ ml: 1, fontWeight: 500 }}
            />
          )}
        </Box>
        <IconButton
          size="small"
          sx={{
            p: 1,
            borderRadius: '8px',
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <Icon icon="tabler:chevron-down" fontSize={18} />
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={4}>
              {/* Customer Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="customer-select-label">Customers</InputLabel>
                  <Select
                    labelId="customer-select-label"
                    id="customer-select"
                    multiple
                    value={selectedCustomers}
                    onChange={handleCustomerChange}
                    input={<OutlinedInput label="Customers" />}
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {selected.map((value) => {
                          const customer = customers.find(c => c._id === value);
                          return (
                            <Chip
                              key={value}
                              label={customer?.name || value}
                              size="small"
                              variant="tonal"
                              color="primary"
                              sx={{ borderRadius: '6px' }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 224,
                          width: 280
                        }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer._id} value={customer._id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    multiple
                    value={selectedStatuses}
                    onChange={handleStatusChange}
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {selected.map((value) => {
                          const statusOption = statusOptions.find(s => s.value === value);
                          return (
                            <Chip
                              key={value}
                              label={statusOption?.label || value}
                              size="small"
                              variant="tonal"
                              color="primary"
                              sx={{ borderRadius: '6px' }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 224,
                          width: 250
                        }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          label: 'From Date',
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            }
                          }
                        }
                      }}
                      value={dateRange.startDate}
                      onChange={(newValue) => handleDateRangeChange('startDate', newValue)}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          label: 'To Date',
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            }
                          }
                        }
                      }}
                      value={dateRange.endDate}
                      onChange={(newValue) => handleDateRangeChange('endDate', newValue)}
                      format="DD/MM/YYYY"
                      minDate={dateRange.startDate || undefined}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={resetFilters}

              size="small"

            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}

              size="small"

            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

export default QuotationFilter;
