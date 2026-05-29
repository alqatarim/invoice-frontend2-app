'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { RiyalIcon, formatCurrency } from '@/utils/currencyUtils';


const PosAdvancedDrawer = ({
  open,
  onClose,
  control,
  errors,
  setValue,
  banks,
  cashierOptions,
  heldSales,
  activeStoreName,
  onLoadHeldSale,
  onDeleteHeldSale,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          px: 6,
          py: 5,

          // borderTopLeftRadius: 16,
          // borderBottomLeftRadius: 16,
          // boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box
        sx={{
          // px: 3,
          // py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // borderBottom: `1px solid ${theme.palette.divider}`,
          // bgcolor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Box className="flex items-center gap-2">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Icon icon="mdi:cog-outline" width={20} color={theme.palette.primary.main} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sale Options
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
          }}
        >
          <Icon icon="mdi:close" width={18} />
        </IconButton>
      </Box>

      <Box className="px-3 py-2.5">

        {activeStoreName ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Active store: ${activeStoreName}`}
            sx={{ alignSelf: 'flex-start' }}
          />
        ) : null}


      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>


        <Box className="flex flex-col justify-evenly gap-3">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Details</Typography>
          <Box className="flex flex-col justify-evenly gap-3">

            <Controller
              name="invoiceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="medium"
                  type="date"
                  label="Invoice Date"
                  disabled={disabled}
                  error={!!errors.invoiceDate}
                  // InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              )}
            />

            <Controller
              name="cashierId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.cashierId}>
                  <InputLabel>Cashier</InputLabel>
                  <Select
                    size="medium"
                    {...field}
                    label="Cashier"
                    value={field.value || ''}
                    disabled={disabled}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      const selectedCashier = (Array.isArray(cashierOptions) ? cashierOptions : [])
                        .find(option => option?._id === event.target.value);
                      setValue('cashierName', selectedCashier?.label || '');
                    }}
                  >
                    {(Array.isArray(cashierOptions) ? cashierOptions : []).length === 0 ? (
                      <MenuItem value="" disabled>
                        No cashiers available
                      </MenuItem>
                    ) : (
                      (Array.isArray(cashierOptions) ? cashierOptions : []).map((option) => (
                        <MenuItem key={option?._id} value={option?._id}>
                          {option?.label || option?.fullName || option?.email || 'Cashier'}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            />

          </Box>

        </Box>
        <Box className="flex flex-col gap-3">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Reference & Bank</Typography>

          <Box className="flex flex-col justify-evenly gap-3">
            <Controller
              name="referenceNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="medium"
                  label="Reference Number"
                  disabled={disabled}
                  error={!!errors.referenceNo}
                />
              )}
            />


            <Controller
              name="bank"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.bank}>
                  <InputLabel>Bank</InputLabel>
                  <Select {...field} label="Bank" disabled={disabled}>
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {(Array.isArray(banks) ? banks : []).map((bank) => (
                      <MenuItem key={bank?._id} value={bank?._id}>
                        {bank?.bankName || bank?.name || 'Bank'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

          </Box>


        </Box>

        <Box className="flex flex-col gap-2">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Notes & Terms</Typography>


          <Box className="flex flex-col justify-evenly gap-3">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="medium"
                  label="Notes"
                  disabled={disabled}
                  // multiline
                  // minRows={2}
                  error={!!errors.notes}
                />
              )}
            />
            <Controller
              name="termsAndCondition"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="medium"
                  label="Terms & Conditions"
                  disabled={disabled}
                  // multiline
                  // minRows={2}
                  error={!!errors.termsAndCondition}
                />
              )}
            />
          </Box>

        </Box>


        <Box className="flex flex-col justify-evenly gap-2">
          <Box className="flex items-center justify-between">
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Held Sales</Typography>
            <Chip
              label={heldSales.length}
              size="small"
              color="primary"
              variant="tonal"
              sx={{ fontWeight: 600, minWidth: 28, }}
            />

          </Box>
          <Box className="flex flex-col justify-evenly gap-2">


            {heldSales.length === 0 ? (
              <Box
                className="flex flex-col items-center justify-evenly gap-2 p-3 rounded-md border border-divider"

              >
                <Icon icon="mdi:tray-alert" width={28} color={theme.palette.text.disabled} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  No held sales
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {heldSales.map((sale) => (
                  <Box
                    key={sale.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md border border-divider"
                  >
                    <Box className="flex flex-1 flex-row items-center justify-between gap-3">
                      <Typography variant="overline" fontSize={13} fontWeight={500} >
                        Hold {String(sale.holdNumber || sale.id).padStart(2, '0')}
                      </Typography>
                      {/* {sale.branchName ? (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {sale.branchName}
                        </Typography>
                      ) : null} */}

                      <Box className="flex flex-ror flex-end items-center gap-0.5">
                        <Typography variant="body1" fontSize={14} fontWeight={500} color="text.secondary">
                          {sale.items?.length || 0} items{' '}&middot;{''}
                        </Typography>

                        <RiyalIcon width={14} color={theme.vars.palette.text.secondary} />
                        <Typography variant="body1" fontSize={14} fontWeight={500} color="text.secondary">
                          {sale.total}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={disabled}
                        onClick={() => {
                          onLoadHeldSale(sale.id);
                          onClose();
                        }}

                      >
                        <Icon icon="mdi:play-circle-outline" width={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={disabled}
                        onClick={() => onDeleteHeldSale(sale.id)}
                      >
                        <Icon icon="mdi:delete-outline" width={18} />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>

      </Box>
    </Drawer>
  );
};

export default PosAdvancedDrawer;
