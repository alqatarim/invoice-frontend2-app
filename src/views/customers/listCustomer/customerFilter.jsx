'use client'

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
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { customerTabs } from '@/data/dataSets';

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
                variant="tonal"
                color="primary"
                className="rounded-md"
              />
            );
          })}
        </div>
      )}
      MenuProps={{
        PaperProps: {
          style: { maxHeight: 224, width: 280 }
        }
      }}
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

const CustomerFilter = ({
  onChange,
  onApply,
  onReset,
  customerOptions = [],
  values = {},
  tab = [],
  onTabChange,
  onManageColumns,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    customer: values.customer || [],
    search: values.search || '',
  });

  // Sync local state with external values
  useEffect(() => {
    setLocalFilters({
      customer: values.customer || [],
      search: values.search || '',
    });
  }, [values]);

  // Handlers
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const handleSelectChange = (field) => (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;
    handleLocalFilterChange(field, value);
  };

  const handleSearchChange = (event) => {
    handleLocalFilterChange('search', event.target.value);
  };

  const applyFilters = () => {
    const currentFilterValues = {
      customer: localFilters.customer,
      search: localFilters.search,
      status: tab || []
    };
    onApply(currentFilterValues);
  };

  const resetFilters = () => {
    setLocalFilters({
      customer: [],
      search: '',
    });
    onReset();
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.customer.length > 0) count++;
    if (localFilters.search) count++;
    if (tab?.length > 0 && !tab.includes('ALL')) count++;
    return count;
  }, [localFilters, tab]);

  return (
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
            Customer Filters
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
            {/* Status Filter Section */}
            <Grid item xs={12}>
              <ToggleButtonGroup
                color="primary"
                value={tab}
                exclusive={false}
                onChange={onTabChange}
                aria-label="customer status filter"
              >
                {customerTabs.map((tabObj) => (
                  <ToggleButton
                    key={tabObj.value}
                    value={tabObj.value}
                    aria-label={tabObj.label}
                    size="medium"
                  >
                    {tabObj.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            {/* Search Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Customers"
                value={localFilters.search}
                onChange={handleSearchChange}
                placeholder="Search by name, email, or phone"
                InputProps={{
                  startAdornment: <Icon icon="mdi:magnify" className="mr-2" />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>

            {/* Customer Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelectDropdown
                id="customer-select"
                label="Customers"
                value={localFilters.customer}
                onChange={handleSelectChange('customer')}
                options={customerOptions.map(customer => ({
                  value: customer._id || customer.id,
                  label: customer.name
                }))}
              />
            </Grid>
          </Grid>

          <div className='flex justify-end gap-3 mt-6'>
            <Button
              variant="text"
              size="medium"
              startIcon={<Icon icon="material-symbols:view-column-2" width={22} />}
              onClick={(e) => {
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
              startIcon={<Icon icon="tabler:search" />}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Collapse>
    </Card>
  );
};

export default CustomerFilter;