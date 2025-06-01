'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
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
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';

/**
 * Reusable multi-select dropdown component
 */
const MultiSelectDropdown = ({
  label,
  value = [],
  onChange,
  options = [],
  id
}) => (
  <FormControl fullWidth size="small">
    <InputLabel id={`${id}-label`}>{label}</InputLabel>
    <Select
      labelId={`${id}-label`}
      id={id}
      multiple
      value={value}
      onChange={onChange}
      input={<OutlinedInput label={label} />}
      renderValue={(selected) => (
        <div className="flex flex-row flex-wrap gap-1">
          {selected.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Chip
                key={val}
                label={option?.label || val}
                size="small"
                className="max-w-[120px]"
                sx={{
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100px'
                  }
                }}
              />
            );
          })}
        </div>
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        }
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

/**
 * Date Range Picker Component
 */
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => (
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
        value={startDate}
        onChange={onStartChange}
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
        value={endDate}
        onChange={onEndChange}
        format="DD/MM/YYYY"
        minDate={startDate || undefined}
      />
    </Grid>
  </Grid>
);

const PurchaseReturnFilterNew = ({
  setFilterCriteria,
  vendors = [],
  resetAllFilters,
  values = {},
  onManageColumns
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    vendor: values.vendor || [],
    startDate: values.fromDate ? dayjs(values.fromDate) : null,
    endDate: values.toDate ? dayjs(values.toDate) : null,
    status: values.status || [],
  });

  // Convert vendors to options format
  const vendorOptions = useMemo(() => 
    vendors.map(vendor => ({
      value: vendor._id,
      label: vendor.vendor_name
    })),
    [vendors]
  );

  // Status options for purchase returns
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Sync local state with external values
  useEffect(() => {
    setLocalFilters({
      vendor: values.vendor || [],
      startDate: values.fromDate ? dayjs(values.fromDate) : null,
      endDate: values.toDate ? dayjs(values.toDate) : null,
      status: values.status || [],
    });
  }, [values]);

  // Handlers
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field) => (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;
    handleLocalFilterChange(field, value);
  };

  const applyFilters = () => {
    const currentFilterValues = {
      vendors: localFilters.vendor,
      status: localFilters.status,
      fromDate: localFilters.startDate ? dayjs(localFilters.startDate).format('YYYY-MM-DD') : '',
      toDate: localFilters.endDate ? dayjs(localFilters.endDate).format('YYYY-MM-DD') : '',
    };
    setFilterCriteria(currentFilterValues);
  };

  const resetFilters = () => {
    setLocalFilters({
      vendor: [],
      startDate: null,
      endDate: null,
      status: [],
    });
    resetAllFilters();
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.vendor.length > 0) count++;
    if (localFilters.status.length > 0) count++;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    return count;
  }, [localFilters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        elevation={0}
        sx={{
          border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          borderRadius: '16px'
        }}
      >
        {/* Filter Header */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                color: theme.palette.success.main
              }}
            >
              <Icon icon="tabler:filter" fontSize={20} />
            </div>
            <Typography variant="h6" className="font-semibold">
              Purchase Return Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                size="small"
                label={`${activeFilterCount} active`}
                color="success"
                variant="tonal"
                className="ml-1 font-medium"
              />
            )}
          </div>

          <IconButton
            size="small"
            className="p-2 rounded-lg transition-transform duration-300 ease-in-out"
            style={{
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              color: theme.palette.success.main,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <Icon icon="tabler:chevron-down" fontSize={18} />
          </IconButton>
        </div>

        <Collapse in={open}>
          <Divider />
          <div className="p-6">
            <Grid container spacing={4}>
              {/* Vendor Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <MultiSelectDropdown
                  id="vendor-select"
                  label="Vendors"
                  value={localFilters.vendor}
                  onChange={handleSelectChange('vendor')}
                  options={vendorOptions}
                />
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <MultiSelectDropdown
                  id="status-select"
                  label="Status"
                  value={localFilters.status}
                  onChange={handleSelectChange('status')}
                  options={statusOptions}
                />
              </Grid>

              {/* Date Range Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <DateRangePicker
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  onStartChange={(newValue) => handleLocalFilterChange('startDate', newValue)}
                  onEndChange={(newValue) => handleLocalFilterChange('endDate', newValue)}
                />
              </Grid>
            </Grid>

            <div className='flex justify-end gap-3 mt-6'>
              <Button
                variant="outlined"
                onClick={resetFilters}
                size="medium"
                startIcon={<Icon icon="tabler:refresh" />}
              >
                Reset Filters
              </Button>

              {onManageColumns && (
                <Button
                  variant="outlined"
                  onClick={onManageColumns}
                  size="medium"
                  startIcon={<Icon icon="tabler:columns" />}
                >
                  Columns
                </Button>
              )}

              <Button
                variant="contained"
                onClick={applyFilters}
                size="medium"
                startIcon={<Icon icon="tabler:check" />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
                  }
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Collapse>
      </Card>
    </LocalizationProvider>
  );
};

export default PurchaseReturnFilterNew;