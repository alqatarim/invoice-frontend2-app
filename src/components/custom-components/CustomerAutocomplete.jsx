import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  useTheme,
  Grid,
  MenuItem,
  alpha
} from '@mui/material'
import { Icon } from '@iconify/react'

const CustomerAutocomplete = ({
  control,
  errors,
  customersData
}) => {
  const theme = useTheme()

  // Simple customer row with name, phone, and email
  const renderCustomerRow = (customer) => {
    return (
      <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
        {/* Customer Name */}
        <Grid size={{ xs: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {customer.name}
          </Typography>
        </Grid>

        {/* Phone */}
        <Grid size={{ xs: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {customer.phone || '—'}
          </Typography>
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 5 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {customer.email || '—'}
          </Typography>
        </Grid>
      </Grid>
    )
  }

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
      render={({ field }) => {
        const selectedCustomer = getSelectedCustomer(field.value)

        return (
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
            value={selectedCustomer}
            onChange={(_, newValue) => field.onChange(newValue?._id || '')}
            renderInput={params => (
              <TextField
                {...params}
                label="Customer"
                error={!!errors.customerId}
                helperText={errors.customerId?.message}
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: selectedCustomer ? (
                    <Box

                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 0,
                        maxWidth: '80%',
                        ml: 1
                      }}
                      className='bg-secondaryLighter rounded-md py-0.5 px-2'
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 0,
                        justifyContent: 'flex-end'
                      }}>
                        <Icon icon="mdi:phone" width={14} color={theme.palette.text.secondary} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0,
                            userSelect: 'text',
                            cursor: 'text',
                            '&:hover': {
                              color: 'text.primary'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.getSelection) {
                              const selection = window.getSelection();
                              const range = document.createRange();
                              range.selectNodeContents(e.currentTarget);
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }
                          }}
                        >
                          {selectedCustomer.phone || 'No phone'}
                        </Typography>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 0,
                        justifyContent: 'flex-end'
                      }}>
                        <Icon icon="mdi:email-outline" width={14} color={theme.palette.text.secondary} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0,
                            userSelect: 'text',
                            cursor: 'text',
                            '&:hover': {
                              color: 'text.primary'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.getSelection) {
                              const selection = window.getSelection();
                              const range = document.createRange();
                              range.selectNodeContents(e.currentTarget);
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }
                          }}
                        >
                          {selectedCustomer.email || 'No email'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (params.InputProps.endAdornment || null)
                }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: !errors.customerId ? theme.palette.text.secondary : undefined,
                    fontSize: '0.75rem'
                  },
                  '& .MuiInputBase-root': {
                    paddingRight: selectedCustomer ? '4px' : undefined
                  },
                  '& .MuiInputBase-input': {
                    paddingRight: selectedCustomer ? '0px' : undefined
                  }
                }}
              />
            )}
            renderOption={(props, option, { index }) => (
              <>
                {index === 0 && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Name
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 3 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Phone
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Email
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                <MenuItem
                  {...props}
                  sx={{
                    py: 1,
                    px: 2,
                    display: 'block',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  {renderCustomerRow(option)}
                </MenuItem>
              </>
            )}
            noOptionsText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
                <Icon icon="mdi:account-search" width={24} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  No customers found
                </Typography>
              </Box>
            }
            loadingText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
                <Icon icon="mdi:loading" className="animate-spin" width={20} color={theme.palette.primary.main} />
                <Typography variant="body2" color="text.secondary">
                  Loading customers...
                </Typography>
              </Box>
            }
            ListboxProps={{
              sx: {
                maxHeight: '300px',
                '& .MuiAutocomplete-option': {
                  padding: '8px 16px'
                },
                '& .MuiAutocomplete-noOptions': {
                  padding: '16px'
                },
                '& .MuiAutocomplete-loading': {
                  padding: '16px'
                }
              }
            }}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: theme.shadows[8],
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                mt: 1
              }
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disableClearable
            autoHighlight
            openOnFocus
          />
        )
      }}
    />
  )
}

export default CustomerAutocomplete
