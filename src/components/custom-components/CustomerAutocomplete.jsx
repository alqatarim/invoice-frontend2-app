import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  useTheme,
  alpha
} from '@mui/material'
import { Icon } from '@iconify/react'

const CustomerAutocomplete = ({
  control,
  errors,
  customersData,
  includeWalkInOption = false,
  walkInLabel = 'Walk-in Customer',
  onCustomerChange,
  size = 'small'
}) => {
  const theme = useTheme()
  const customers = Array.isArray(customersData) ? customersData : []

  // If a real "Walk-in Customer" exists in DB, prefer it (avoid duplicates).
  const walkInFromData = includeWalkInOption
    ? customers.find((customer) => String(customer?.name || '').trim().toLowerCase() === String(walkInLabel || '').trim().toLowerCase())
    : null

  const walkInOption = includeWalkInOption
    ? (walkInFromData ? { ...walkInFromData, isWalkIn: true } : { _id: 'walk-in', name: walkInLabel, phone: '', email: '', isWalkIn: true })
    : null

  const options = includeWalkInOption
    ? [walkInOption, ...customers.filter((customer) => customer?._id !== walkInOption?._id)]
    : customers

  // Custom value rendering in the input
  const getSelectedCustomer = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      // Back-compat: some screens still set customerId to "walk-in"
      if (includeWalkInOption && value === 'walk-in') return walkInOption;
      return options.find(c => c?._id === value) || null;
    }
    if (value._id) return value;
    return null;
  };

  return (
    <Controller
      name="customerId"
      control={control}
      render={({ field }) => {
        const selectedCustomer = getSelectedCustomer(field.value)
        const optionGridColumns = 'minmax(0, 1.2fr) minmax(0, 0.85fr) minmax(0, 1.25fr)'

        const CustomerOptionsListbox = React.forwardRef(function CustomerOptionsListbox(listboxProps, ref) {
          const { children, sx, ...other } = listboxProps

          return (
            <Box
              component="ul"
              ref={ref}
              {...other}
              sx={[
                { m: 0, p: 0, listStyle: 'none' },
                sx
              ]}
            >
              <Box
                component="li"
                role="presentation"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: optionGridColumns,
                  columnGap: 2,
                  alignItems: 'center',
                  px: 6,
                  py: 2.5,
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  bgcolor: theme.palette.background.default,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}
                >
                  Name
                </Typography>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}
                >
                  Phone
                </Typography>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}
                >
                  Email
                </Typography>
              </Box>
              {children}
            </Box>
          )
        })

        return (
          <Autocomplete
            fullWidth
            size={size}
            options={options}
            getOptionLabel={option => option?.name || walkInLabel}
            filterOptions={(options, { inputValue }) => {
              const search = inputValue.trim().toLowerCase()
              if (!search) return options
              return options.filter((option) => {
                const name = option?.name || ''
                const phone = option?.phone || ''
                const email = option?.email || ''
                return [name, phone, email]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(search))
              })
            }}
            value={selectedCustomer}
            onChange={(_, newValue) => {
              field.onChange(newValue?._id || '')
              if (onCustomerChange) onCustomerChange(newValue || null)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Customer"
                error={!!errors.customerId}
                helperText={errors.customerId?.message}
                size={size}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: selectedCustomer ? (
                    <Box

                      className='flex flex-col items-start justify-end gap-0 bg-secondaryLightest rounded-md py-0.5 px-2'
                      sx={{
                        // Give the input value priority over this endAdornment.
                        // This keeps the adornment from consuming too much horizontal space.
                        flex: '0 1 auto',
                        minWidth: 0,
                        maxWidth: 'min(240px, 50%)',
                        overflow: 'hidden',
                        // ml: 1
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        minWidth: 0,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        justifyContent: 'flex-end'
                      }}

                      >

                        <Icon icon="mdi:phone" width={14} color={theme.palette.text.secondary} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.72rem',
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
                          {selectedCustomer.phone || ''}
                        </Typography>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        minWidth: 0,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        justifyContent: 'flex-end'
                      }}>
                        <Icon icon="mdi:email-outline" width={14} color={theme.palette.text.secondary} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.72rem',
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
                          {selectedCustomer.email || ''}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (params.InputProps.endAdornment || null)
                }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: !errors.customerId ? theme.palette.text.secondary : undefined,
                    fontSize: '0.72rem'
                  },
                  ...(selectedCustomer
                    ? {
                      // Autocomplete reserves extra right padding for popup/clear icons.
                      // When we replace endAdornment, that reserved space becomes blank.
                      '& .MuiAutocomplete-inputRoot': {
                        paddingRight: '12px !important'
                      },
                      '& .MuiAutocomplete-input': {
                        paddingRight: '0 !important'
                      }
                    }
                    : {})
                }}
              />
            )}
            renderOption={(props, option, { index: optionIndex }) => {
              const { key, ...optionProps } = props
              const zebraBg = optionIndex % 2 ? alpha(theme.palette.primary.main, 0.015) : 'transparent'

              return (
                <Box
                  key={key}
                  component="li"
                  {...optionProps}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: optionGridColumns,
                    columnGap: 2,
                    alignItems: 'center',
                    px: 6,
                    py: 0.9,
                    minHeight: 38,
                    backgroundColor: zebraBg,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    transition: 'background-color 120ms ease',
                    '&:last-of-type': { borderBottom: 'none' },
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.lightestOpacity
                    },
                    '&[data-focus="true"]': {
                      backgroundColor: theme.palette.primary.main
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: theme.palette.primary.lightOpacity
                    },
                    '&[aria-selected="true"][data-focus="true"]': {
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      minWidth: 0,
                      fontSize: '0.8rem'
                    }}
                  >
                    {option?.name || walkInLabel}
                  </Typography>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      minWidth: 0,
                      fontSize: '0.8rem'
                    }}
                  >
                    {option?.phone || '—'}
                  </Typography>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      minWidth: 0,
                      fontSize: '0.8rem'
                    }}
                  >
                    {option?.email || '—'}
                  </Typography>
                </Box>
              )
            }}
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
            slots={{ listbox: CustomerOptionsListbox }}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: theme.shadows[8],
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                mt: 1,
                overflow: 'hidden'
              }
            }}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                sx: {
                  width: 'auto !important',
                  minWidth: 520,
                  maxWidth: 'min(760px, calc(100vw - 32px))'
                }
              },
              listbox: {
                sx: {
                  maxHeight: 320,
                  py: 0
                }
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
