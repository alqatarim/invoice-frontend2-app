'use client';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';

export default function SimpleOptionAutocomplete({
  options = [],
  value = '',
  onChange,
  getOptionLabel = option => option?.label || option?.name || '',
  getOptionDescription,
  label,
  placeholder = '',
  helperText = '',
  error = false,
  required = false,
  disabled = false,
  size = 'medium',
  noOptionsText = 'No options found',
}) {
  const selectedOption = options.find(option => String(option?._id || option?.value || '') === String(value || '')) || null;

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      options={options}
      value={selectedOption}
      size={size}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) =>
        String(option?._id || option?.value || '') === String(selected?._id || selected?.value || '')
      }
      onChange={(_, newValue) => onChange?.(newValue?._id || newValue?.value || '')}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          error={error}
          required={required}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const description = getOptionDescription?.(option);

        return (
          <Box key={key} component="li" {...optionProps}>
            <Box className="min-w-0">
              <Typography noWrap>{getOptionLabel(option)}</Typography>
              {description ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      noOptionsText={noOptionsText}
      openOnFocus
    />
  );
}
