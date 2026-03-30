'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
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

const SectionHeader = ({ icon, label, theme }) => (
  <Box className="flex items-center gap-2 mb-3">
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      }}
    >
      <Icon icon={icon} width={18} color={theme.palette.primary.main} />
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {label}
    </Typography>
  </Box>
);

const PosAdvancedDrawer = ({
  open,
  onClose,
  control,
  errors,
  setValue,
  banks,
  signOptions,
  heldSales,
  activeStoreName,
  onLoadHeldSale,
  onDeleteHeldSale,
  onResumeLatest,
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
          padding: 3
          // borderTopLeftRadius: 16,
          // borderBottomLeftRadius: 16,
          // boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
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

      <Box sx={{ px: 3, py: 3, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <Box className="flex flex-col gap-2">

          {activeStoreName ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Active store: ${activeStoreName}`}
              sx={{ alignSelf: 'flex-start' }}
            />
          ) : null}

          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: 14 }}>Details</Typography>
          <Box className="flex flex-row justify-evenly gap-2">

            <Controller
              name="invoiceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  type="date"
                  label="Invoice Date"
                  error={!!errors.invoiceDate}
                  helperText={errors.invoiceDate?.message}
                  // InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              )}
            />


            <Controller

              name="signatureId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.signatureId}>
                  <InputLabel>Cashier</InputLabel>
                  <Select

                    {...field}
                    label="Cashier"
                    value={field.value || ''}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      setValue('sign_type', 'manualSignature');
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {(Array.isArray(signOptions) ? signOptions : []).map((option) => (
                      <MenuItem key={option?._id} value={option?._id}>
                        {option?.signatureName || option?.label || 'Cashier'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.signatureId ? (
                    <FormHelperText>{errors.signatureId.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />

          </Box>

        </Box>

        <Box className="flex flex-col gap-2">
          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: 14 }}>Reference & Bank</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Controller
                name="referenceNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Reference Number"
                    error={!!errors.referenceNo}
                    helperText={errors.referenceNo?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="bank"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.bank}>
                    <InputLabel>Bank</InputLabel>
                    <Select {...field} label="Bank">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {(Array.isArray(banks) ? banks : []).map((bank) => (
                        <MenuItem key={bank?._id} value={bank?._id}>
                          {bank?.bankName || bank?.name || 'Bank'}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.bank ? <FormHelperText>{errors.bank.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

        </Box>

        <Box className="flex flex-col gap-2">
          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: 14 }}>Notes & Terms</Typography>


          <Stack spacing={2.5}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Notes"
                  multiline
                  minRows={2}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
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
                  size="small"
                  label="Terms & Conditions"
                  multiline
                  minRows={2}
                  error={!!errors.termsAndCondition}
                  helperText={errors.termsAndCondition?.message}
                />
              )}
            />
          </Stack>

        </Box>


        <Box className="flex items-center justify-between mb-3">
          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: 14 }}>Held Sales</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {heldSales.length > 0 ? (
              <Chip
                label="Resume Latest"
                size="small"
                color="secondary"
                variant="outlined"
                onClick={() => {
                  onResumeLatest();
                  onClose();
                }}
                clickable
              />
            ) : null}
            <Chip
              label={heldSales.length}
              size="small"
              color="primary"
              variant="tonal"
              sx={{ fontWeight: 600, minWidth: 28, }}
            />
          </Stack>
        </Box>
        {heldSales.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 3,
              px: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.text.primary, 0.02),
              border: `1px dashed ${theme.palette.divider}`,
            }}
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
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.background.paper, 1),
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Hold {String(sale.holdNumber || sale.id).padStart(2, '0')}
                  </Typography>
                  {sale.branchName ? (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {sale.branchName}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {sale.items?.length || 0} items &middot;{' '}
                    {Number(sale.total || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      onLoadHeldSale(sale.id);
                      onClose();
                    }}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                    }}
                  >
                    <Icon icon="mdi:play-circle-outline" width={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteHeldSale(sale.id)}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                    }}
                  >
                    <Icon icon="mdi:delete-outline" width={18} />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default PosAdvancedDrawer;
