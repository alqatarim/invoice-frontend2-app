import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { Icon } from '@iconify/react';

const SELECTED_PHONE_MAX_CHARS = 0;
const SELECTED_EMAIL_MAX_CHARS = 33;

const truncateVendorText = (value = '', maxChars = 0) => {
  const text = String(value || '');
  if (!maxChars || text.length <= maxChars) return text;

  return `${text.slice(0, maxChars)}...`;
};

const getVendorName = vendor => vendor?.vendor_name || vendor?.name || '';
const getVendorPhone = vendor => vendor?.vendor_phone || vendor?.phone || '';
const getVendorEmail = vendor => vendor?.vendor_email || vendor?.email || '';

const VendorAutocomplete = ({
  control,
  errors,
  vendorsData,
  onVendorChange,
  size = 'small',
  label = 'Vendor',
  placeholder = '',
  inputRef = null,
  disabled = false,
}) => {
  const theme = useTheme();
  const vendors = Array.isArray(vendorsData) ? vendorsData : [];
  const optionGridColumns = 'minmax(0, 1.2fr) minmax(0, 0.85fr) minmax(0, 1.25fr)';

  const getSelectedVendor = value => {
    if (!value) return null;
    if (typeof value === 'string') {
      return vendors.find(vendor => vendor?._id === value) || null;
    }
    if (value._id) return value;
    return null;
  };

  const VendorOptionsListbox = React.forwardRef(function VendorOptionsListbox(listboxProps, ref) {
    const { children, sx, ...other } = listboxProps;

    return (
      <Box
        component="ul"
        ref={ref}
        {...other}
        sx={[{ m: 0, p: 0, listStyle: 'none' }, sx]}
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
            bgcolor: theme.vars.palette.background.default,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            Name
          </Typography>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            Phone
          </Typography>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            Email
          </Typography>
        </Box>
        {children}
      </Box>
    );
  });

  return (
    <Controller
      name="vendorId"
      control={control}
      render={({ field }) => {
        const selectedVendor = getSelectedVendor(field.value);
        const selectedVendorLabel = String(getVendorName(selectedVendor)).trim().toLowerCase();
        const hasSelectedVendorContact = Boolean(getVendorPhone(selectedVendor) || getVendorEmail(selectedVendor));
        const selectedPhoneLabel = truncateVendorText(getVendorPhone(selectedVendor), SELECTED_PHONE_MAX_CHARS);
        const selectedEmailLabel = truncateVendorText(getVendorEmail(selectedVendor), SELECTED_EMAIL_MAX_CHARS);

        return (
          <Autocomplete
            fullWidth
            size={size}
            disabled={disabled}
            options={vendors}
            getOptionLabel={option => getVendorName(option)}
            filterOptions={(options, { inputValue }) => {
              const search = inputValue.trim().toLowerCase();
              if (!search || (selectedVendorLabel && search === selectedVendorLabel)) return options;

              return options.filter(option => {
                const name = getVendorName(option);
                const phone = getVendorPhone(option);
                const email = getVendorEmail(option);

                return [name, phone, email]
                  .filter(Boolean)
                  .some(value => String(value).toLowerCase().includes(search));
              });
            }}
            value={selectedVendor}
            onChange={(_, newValue) => {
              field.onChange(newValue?._id || '');
              onVendorChange?.(newValue || null);
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={!!errors.vendorId}
                helperText={errors.vendorId?.message}
                size={size}
                inputRef={inputRef}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: selectedVendor && hasSelectedVendorContact ? (
                    <>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 14,
                          bottom: 7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          overflow: 'hidden',
                          pointerEvents: 'auto',
                        }}
                        className="bg-secondaryLighter rounded-md py-0.5 px-2"
                      >
                        {getVendorPhone(selectedVendor) ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flex: '0 0 auto',
                              minWidth: 'max-content',
                              overflow: 'visible',
                            }}
                          >
                            <Icon icon="mdi:phone" width={13} color={theme.vars.palette.text.secondary} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'visible',
                                minWidth: 'max-content',
                                userSelect: 'text',
                                cursor: 'text',
                                '&:hover': {
                                  color: 'text.primary',
                                },
                              }}
                              onClick={event => {
                                event.stopPropagation();
                                if (window.getSelection) {
                                  const selection = window.getSelection();
                                  const range = document.createRange();
                                  range.selectNodeContents(event.currentTarget);
                                  selection.removeAllRanges();
                                  selection.addRange(range);
                                }
                              }}
                              title={getVendorPhone(selectedVendor)}
                            >
                              {selectedPhoneLabel}
                            </Typography>
                          </Box>
                        ) : null}
                        {getVendorEmail(selectedVendor) ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flex: '1 1 auto',
                              minWidth: 0,
                              overflow: 'hidden',
                            }}
                          >
                            <Icon icon="mdi:email-outline" width={13} color={theme.vars.palette.text.secondary} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                                userSelect: 'text',
                                cursor: 'text',
                                '&:hover': {
                                  color: 'text.primary',
                                },
                              }}
                              onClick={event => {
                                event.stopPropagation();
                                if (window.getSelection) {
                                  const selection = window.getSelection();
                                  const range = document.createRange();
                                  range.selectNodeContents(event.currentTarget);
                                  selection.removeAllRanges();
                                  selection.addRange(range);
                                }
                              }}
                              title={getVendorEmail(selectedVendor)}
                            >
                              {selectedEmailLabel}
                            </Typography>
                          </Box>
                        ) : null}
                      </Box>
                      {params.InputProps.endAdornment}
                    </>
                  ) : params.InputProps.endAdornment,
                  startAdornment: params.InputProps.startAdornment,
                }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: !errors.vendorId ? theme.palette.text.secondary : undefined,
                    fontSize: '0.72rem',
                  },
                  ...(selectedVendor
                    ? {
                      '& .MuiInputBase-root': {
                        alignItems: 'flex-start',
                        minHeight: hasSelectedVendorContact ? 58 : undefined,
                        py: hasSelectedVendorContact ? '6px' : undefined,
                      },
                      '& .MuiAutocomplete-input': {
                        fontSize: '0.9rem',
                        lineHeight: 1.25,
                        pt: hasSelectedVendorContact ? '3px !important' : undefined,
                        pb: hasSelectedVendorContact ? '19px !important' : undefined,
                      },
                    }
                    : {}),
                }}
              />
            )}
            renderOption={(props, option, { index: optionIndex }) => {
              const { key, ...optionProps } = props;
              const zebraBg = optionIndex % 2 ? alpha(theme.palette.primary.main, 0.015) : 'transparent';

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
                      backgroundColor: theme.palette.secondary.lightestOpacity,
                    },
                    '&[data-focus="true"]': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: theme.palette.primary.lightOpacity,
                    },
                    '&[aria-selected="true"][data-focus="true"]': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
                    {getVendorName(option) || '—'}
                  </Typography>
                  <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
                    {getVendorPhone(option) || '—'}
                  </Typography>
                  <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: '0.8rem' }}>
                    {getVendorEmail(option) || '—'}
                  </Typography>
                </Box>
              );
            }}
            noOptionsText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
                <Icon icon="mdi:account-search" width={24} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  No vendors found
                </Typography>
              </Box>
            }
            loadingText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 1 }}>
                <Icon icon="mdi:loading" className="animate-spin" width={20} color={theme.palette.primary.main} />
                <Typography variant="body2" color="text.secondary">
                  Loading vendors...
                </Typography>
              </Box>
            }
            slots={{ listbox: VendorOptionsListbox }}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: theme.shadows[8],
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                mt: 1,
                overflow: 'hidden',
              },
            }}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                sx: {
                  width: 'auto !important',
                  minWidth: 520,
                  maxWidth: 'min(760px, calc(100vw - 32px))',
                },
              },
              listbox: {
                sx: {
                  maxHeight: 320,
                  py: 0,
                },
              },
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disableClearable
            autoHighlight
            openOnFocus
          />
        );
      }}
    />
  );
};

export default VendorAutocomplete;
