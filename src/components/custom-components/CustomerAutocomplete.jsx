import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  useTheme,
  Grid,
  MenuItem
} from '@mui/material'

const CustomerAutocomplete = ({
  control,
  errors,
  customersData
}) => {
  const theme = useTheme()

  // Helper to render all three fields in a grid row
  const renderCustomerRow = (customer) => (
    <Grid
      container
      gap={2}
    >

      <Grid item xs={12} sm={12} md={4.75} lg={4.5}  className='truncate text-start py-1' >
      <Typography  variant="h6"  fontWeight={500} color='text.primary' className='text-[0.9rem]' >
       {customer.name}
      </Typography>
      </Grid>

      <Grid item xs={5} sm={5} md={2.5} lg={2.6}  className='truncate rounded text-start py-1' >
        <Typography  variant="h6" className='font-medium text-[0.85rem] text-textSecondary' >
       {customer.phone}
      </Typography>
      </Grid>

      <Grid item xs={5} sm={5} md={4.25} lg={4.5}    className='truncate rounded text-start py-1' >
        <Typography  variant="h6" className='font-medium text-[0.85rem] text-textSecondary' >
       {customer.email}
      </Typography>
      </Grid>

    </Grid>
  )

  // Custom value rendering in the input
  const getSelectedCustomer = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return customersData.find(c => c._id === value) || null;
    if (value._id) return value;
    return null;
  };

  return (
    <Controller
      name="customerId"
      control={control}
      render={({ field }) => (
        <Autocomplete
        fullWidth
          options={customersData}
          getOptionLabel={option => option.name}
          filterOptions={(options, { inputValue }) => {
            const search = inputValue.toLowerCase()
            return options.filter(opt =>
              opt.name.toLowerCase().includes(search) ||
              opt.phone.toLowerCase().includes(search) ||
              opt.email.toLowerCase().includes(search)
            )
          }}
          value={getSelectedCustomer(field.value)}
          onChange={(_, newValue) => field.onChange(newValue?._id || '')}
          renderInput={params => (
            <TextField
              {...params}
              label="Customer"
              error={!!errors.customerId}
              helperText={errors.customerId?.message}
              size="small"

            />
          )}
          renderOption={(props, option) => (
            <MenuItem

              {...props}

            >
              {renderCustomerRow(option)}
            </MenuItem>
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          disableClearable
          autoHighlight
          openOnFocus
        />
      )}
    />
  )
}

export default CustomerAutocomplete
