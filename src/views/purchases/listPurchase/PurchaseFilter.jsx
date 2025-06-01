'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
}) => {
  // Memoize MenuProps to prevent re-creation
  const menuProps = useMemo(() => ({
    PaperProps: {
      style: { maxHeight: 224, width: 280 }
    }
  }), []);

  // Memoize sx prop to prevent re-creation
  const sxProps = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
    }
  }), []);

  return (
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
                  variant="tonal"
                  color="primary"
                  className="rounded-md"
                />
              );
            })}
          </div>
        )}
        MenuProps={menuProps}
        sx={sxProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

/**
 * Date range picker component
 */
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => {
  // Memoize sx props to prevent re-creation
  const textFieldSx = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
    }
  }), []);

  const startDateSlotProps = useMemo(() => ({
    textField: {
      size: 'small',
      fullWidth: true,
      label: 'From Date',
      sx: textFieldSx
    }
  }), [textFieldSx]);

  const endDateSlotProps = useMemo(() => ({
    textField: {
      size: 'small',
      fullWidth: true,
      label: 'To Date',
      sx: textFieldSx
    }
  }), [textFieldSx]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <DatePicker
          slotProps={startDateSlotProps}
          value={startDate}
          onChange={onStartChange}
          format="DD/MM/YYYY"
        />
      </Grid>
      <Grid item xs={6}>
        <DatePicker
          slotProps={endDateSlotProps}
          value={endDate}
          onChange={onEndChange}
          format="DD/MM/YYYY"
          minDate={startDate || undefined}
        />
      </Grid>
    </Grid>
  );
};

const PurchaseFilter = ({
  setFilterCriteria,
  vendors = [],
  resetAllFilters,
  values = {},
  onManageColumns
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    vendor: [],
    startDate: null,
    endDate: null,
  });

  // Convert vendors to options format - memoized
  const vendorOptions = useMemo(() =>
    vendors.map(vendor => ({
      value: vendor._id,
      label: vendor.vendor_name
    })),
    [vendors]
  );

  // Memoize the values to prevent unnecessary re-renders
  const memoizedValues = useMemo(() => ({
    vendor: values.vendor || [],
    fromDate: values.fromDate,
    toDate: values.toDate
  }), [values.vendor, values.fromDate, values.toDate]);

  // Sync local state with external values - use memoized values
  useEffect(() => {
    setLocalFilters({
      vendor: memoizedValues.vendor,
      startDate: memoizedValues.fromDate ? dayjs(memoizedValues.fromDate) : null,
      endDate: memoizedValues.toDate ? dayjs(memoizedValues.toDate) : null,
    });
  }, [memoizedValues.vendor, memoizedValues.fromDate, memoizedValues.toDate]);

  // Memoize handlers to prevent re-creation
  const handleLocalFilterChange = useCallback((field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectChange = useCallback((field) => (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;
    handleLocalFilterChange(field, value);
  }, [handleLocalFilterChange]);

  const applyFilters = useCallback(() => {
    const currentFilterValues = {
      vendors: localFilters.vendor,
      fromDate: localFilters.startDate ? dayjs(localFilters.startDate).format('YYYY-MM-DD') : '',
      toDate: localFilters.endDate ? dayjs(localFilters.endDate).format('YYYY-MM-DD') : '',
    };
    setFilterCriteria(currentFilterValues);
  }, [localFilters, setFilterCriteria]);

  const resetFilters = useCallback(() => {
    setLocalFilters({
      vendor: [],
      startDate: null,
      endDate: null,
    });
    resetAllFilters();
  }, [resetAllFilters]);

  const toggleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  // Calculate active filter count - memoized
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.vendor.length > 0) count++;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    return count;
  }, [localFilters]);

  // Memoize style objects to prevent re-creation
  const cardSx = useMemo(() => ({
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
    borderRadius: '16px'
  }), [theme]);

  const iconContainerStyle = useMemo(() => ({
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main
  }), [theme]);

  const iconButtonStyle = useMemo(() => ({
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
  }), [theme, open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card elevation={0} sx={cardSx}>
        {/* Filter Header */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer"
          onClick={toggleOpen}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg flex items-center justify-center"
              style={iconContainerStyle}
            >
              <Icon icon="tabler:filter" fontSize={20} />
            </div>
            <Typography variant="h6" className="font-semibold">
              Purchase Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                size="small"
                label={`${activeFilterCount} active`}
                color="primary"
                variant="tonal"
                className="ml-1 font-medium"
              />
            )}
          </div>

          <IconButton
            size="small"
            className="p-2 rounded-lg transition-transform duration-300 ease-in-out"
            style={iconButtonStyle}
          >
            <Icon icon="tabler:chevron-down" fontSize={18} />
          </IconButton>
        </div>

        <Collapse in={open}>
          <Divider />
          <div className="p-6">
            <Grid container spacing={4}>
              {/* Vendor Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <MultiSelectDropdown
                  id="vendor-select"
                  label="Vendors"
                  value={localFilters.vendor}
                  onChange={handleSelectChange('vendor')}
                  options={vendorOptions}
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

export default PurchaseFilter;