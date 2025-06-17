'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Button,
  Card,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import { debounce } from 'lodash';

/**
 * Customer Autocomplete Component with search functionality
 */
const CustomerAutocomplete = ({
  value = [],
  onChange,
  options = [],
  onSearch,
  loading = false,
  noOptionsText = "No customers found"
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.trim()) {
        setSearchLoading(true);
        try {
          await onSearch(searchTerm);
        } finally {
          setSearchLoading(false);
        }
      }
    }, 300),
    [onSearch]
  );

  // Handle input change for search
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);

    if (reason === 'input') {
      debouncedSearch(newInputValue);
    }
  };

  return (
    <Autocomplete
      multiple
      id="customer-autocomplete"
      options={options}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      loading={searchLoading || loading}
      noOptionsText={noOptionsText}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            label={option.label}
            size="small"
            variant="tonal"
            color="primary"
            className="rounded-md"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Customers"
          placeholder="Type to search customers..."
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            sx: {
              borderRadius: '12px',
            }
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          <div className="flex items-center gap-2">
            <Icon icon="tabler:user" fontSize={16} />
            <span>{option.label}</span>
          </div>
        </li>
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        }
      }}
    />
  );
};

const DeliveryChallanFilter = ({
  onChange,
  onApply,
  onReset,
  customerOptions = [],
  values = {},
  onManageColumns,
  onCustomerSearch
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    customer: values.customer || [],
  });

  // Sync local state with external values
  useEffect(() => {
    setLocalFilters({
      customer: values.customer || [],
    });
  }, [values]);

  // Handlers
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const handleCustomerChange = (newValue) => {
    handleLocalFilterChange('customer', newValue);
  };

  const handleCustomerSearch = useCallback(async (searchTerm) => {
    if (onCustomerSearch) {
      setSearchLoading(true);
      try {
        await onCustomerSearch(searchTerm);
      } finally {
        setSearchLoading(false);
      }
    }
  }, [onCustomerSearch]);

  const applyFilters = () => {
    const currentFilterValues = {
      customer: localFilters.customer,
    };
    onApply(currentFilterValues);
  };

  const resetFilters = () => {
    setLocalFilters({
      customer: [],
    });
    onReset();
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.customer.length > 0) count++;
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
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main
              }}
            >
              <Icon icon="tabler:filter" fontSize={20} />
            </div>
            <Typography variant="h6" className="font-semibold">
              Delivery Challan Filters
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
            style={{
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
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
              {/* Customer Autocomplete Filter */}
              <Grid item xs={12}>
                <CustomerAutocomplete
                  value={localFilters.customer}
                  onChange={handleCustomerChange}
                  options={customerOptions}
                  onSearch={handleCustomerSearch}
                  loading={searchLoading}
                  noOptionsText="Search customers"
                />
              </Grid>
            </Grid>

            <div className='flex justify-end gap-3 mt-6'>
              <Button
                variant="text"
                size="medium"
                startIcon={<Icon icon="material-symbols:view-column-2" width={22} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  onManageColumns();
                }}
              >
                Columns
              </Button>

              <Button
                variant="outlined"
                onClick={resetFilters}
                size="medium"
                startIcon={<Icon icon="tabler:refresh" />}
              >
                Reset Filters
              </Button>

              <Button
                variant="contained"
                onClick={applyFilters}
                size="medium"
                startIcon={<Icon icon="tabler:check" />}
                disabled={localFilters.customer.length === 0}
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

export default DeliveryChallanFilter;