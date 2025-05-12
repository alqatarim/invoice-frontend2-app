import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  Paper,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material'

const CustomerAutocomplete = ({
  control,
  errors,
  customersData
}) => {
  const theme = useTheme()

  // Custom Paper for dropdown to add header row
  const CustomPaper = React.forwardRef(function CustomPaper(props, ref) {
    return (
      <Paper
        ref={ref}
        {...props}
        elevation={8}
        sx={{
          minWidth: 420,
          maxWidth: '100%',
          borderRadius: 2,
          mt: 1,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.10)}`,
            py: 1,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ width: 32, flexShrink: 0 }} />
          <Typography
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 12,
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Name
          </Typography>
          <Typography
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 12,
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Phone
          </Typography>
          <Typography
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 12,
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Email
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
          {props.children}
        </Box>
      </Paper>
    )
  })

  return (
    <Controller
      name="customerId"
      control={control}
      render={({ field }) => (
        <Autocomplete
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
          value={customersData.find(c => c._id === field.value) || null}
          onChange={(_, newValue) => field.onChange(newValue?._id || '')}
          renderInput={params => (
            <TextField
              {...params}
              label="Customer"
              error={!!errors.customerId}
              helperText={errors.customerId?.message}
              size="small"
              inputProps={{
                ...params.inputProps,
                'aria-label': 'Select customer',
                tabIndex: 0
              }}
            />
          )}
          PaperComponent={CustomPaper}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1,
                  minHeight: 44,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
                  backgroundColor: selected
                    ? alpha(theme.palette.primary.main, 0.10)
                    : 'transparent',
                  transition: 'background 0.15s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {/* Avatar with fallback */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: theme.palette.primary.main,
                  }}
                >
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    option.name?.[0]?.toUpperCase() || '?'
                  )}
                </Box>
                {/* Customer Info Columns */}
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    fontSize: '1rem',
                    pr: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={option.name}
                >
                  {option.name}
                </Typography>
                <Tooltip title={option.phone || ''} arrow>
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      color: theme.palette.text.secondary,
                      fontSize: '0.97rem',
                      pr: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {option.phone}
                  </Typography>
                </Tooltip>
                <Tooltip title={option.email || ''} arrow>
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      color: theme.palette.text.disabled,
                      fontSize: '0.97rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {option.email}
                  </Typography>
                </Tooltip>
              </Box>
            </li>
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          fullWidth
          disableClearable
          autoHighlight
          openOnFocus
          ListboxProps={{
            sx: {
              maxHeight: 320,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.18),
                borderRadius: '4px',
              },
            }
          }}
        />
      )}
    />
  )
}

export default CustomerAutocomplete
