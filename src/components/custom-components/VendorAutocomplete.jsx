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

const VendorAutocomplete = ({
  control,
  errors,
  vendorsData
}) => {
  const theme = useTheme()

  // Helper to render all three fields in a grid row
  const renderVendorRow = (vendor) => (
    <Grid
      container
      gap={2}
    >

      <Grid item xs={12} sm={12} md={4.75} lg={4.5}  className='truncate text-start py-1' >
      <Typography  variant="h6"  fontWeight={500} color='text.primary' className='text-[0.9rem]' >
       {vendor.vendor_name}
      </Typography>
      </Grid>

      <Grid item xs={12} sm={12} md={3.25} lg={3.5}  className='truncate text-start py-1' >
      <Typography  variant="body2"  fontWeight={300} color='text.secondary' className='text-[0.8rem]' >
       {vendor.email}
      </Typography>
      </Grid>

      <Grid item xs={12} sm={12} md={3.25} lg={3.5}  className='truncate text-end py-1' >
      <Typography  variant="body2"  fontWeight={300} color='text.secondary' className='text-[0.8rem]' >
       {vendor.phone}
      </Typography>
      </Grid>

    </Grid>
  )

  return (
    <Box>
      <Controller
        name="vendorId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            options={vendorsData || []}
            getOptionLabel={(option) => option.vendor_name || ''}
            value={vendorsData?.find(vendor => vendor._id === value) || null}
            onChange={(event, newValue) => {
              onChange(newValue ? newValue._id : '')
            }}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Vendor"
                placeholder="Type to search vendors..."
                error={!!errors.vendorId}
                helperText={errors.vendorId?.message}
                size="small"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  style: {
                    fontSize: '0.875rem'
                  }
                }}
              />
            )}
            renderOption={(props, vendor) => (
              <MenuItem {...props} key={vendor._id}>
                {renderVendorRow(vendor)}
              </MenuItem>
            )}
            sx={{
              '& .MuiAutocomplete-listbox': {
                '& .MuiMenuItem-root': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': {
                    borderBottom: 'none'
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }
              }
            }}
            ListboxProps={{
              style: {
                maxHeight: '200px'
              }
            }}
          />
        )}
      />
    </Box>
  )
}

export default VendorAutocomplete