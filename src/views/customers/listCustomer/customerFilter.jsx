'use client'

import React, { useState, useMemo } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
import {
  Card,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Typography,
} from '@mui/material'
import { Icon } from '@iconify/react'

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

  // Status options
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ]

  const handleFilterChange = (field, value) => {
    onChange(field, value)
  }

  const handleSearchChange = (event) => {
    handleFilterChange('search', event.target.value)
  }

  const handleStatusChange = (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value
    handleFilterChange('status', value)
    onTabChange(value)
  }

  const handleCustomerChange = (event) => {
    const value = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value
    handleFilterChange('customerId', value)
  }

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (values.search) count++;
    if (values.status?.length > 0) count++;
    if (values.customerId?.length > 0) count++;
    return count;
  }, [values]);

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
            {/* Search Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Customers"
                value={values.search || ''}
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

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelectDropdown
                id="status-select"
                label="Status"
                value={values.status || []}
                onChange={handleStatusChange}
                options={statusOptions}
              />
            </Grid>

            {/* Customer Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelectDropdown
                id="customer-select"
                label="Select Customers"
                value={values.customerId || []}
                onChange={handleCustomerChange}
                options={customerOptions.map(customer => ({
                  value: customer._id,
                  label: customer.name
                }))}
              />
            </Grid>
          </Grid>

          {/* Action Buttons - matches invoice filter layout exactly */}
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
              onClick={onReset}
              size="medium"
              startIcon={<Icon icon="tabler:refresh" />}
            >
              Reset Filters
            </Button>

            <Button
              variant="contained"
              onClick={onApply}
              size="medium"
              startIcon={<Icon icon="tabler:check" />}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Collapse>
    </Card>
  )
}

export default CustomerFilter