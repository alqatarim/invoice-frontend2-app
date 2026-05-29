'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';

const InvoiceOptionsDrawer = ({
  open,
  onClose,
  controller,
  activeStoreName,
  heldInvoices = [],
  onLoadHeldInvoice,
  onDeleteHeldInvoice,
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
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            Invoice Options
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
        <Box className="flex flex-col gap-3">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>
            Reference & Bank
          </Typography>

          <Box className="flex flex-col justify-evenly gap-3">
            <Box className="flex flex-row justify-between gap-1">
              <Controller
                name="bank"
                control={controller.control}
                render={({ field }) => (
                  <FormControl fullWidth size="medium" error={!!controller.errors.bank}>
                    <InputLabel>Select Bank</InputLabel>
                    <Select {...field} label="Select Bank" value={field.value || ''}>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {(controller.banks || []).map(bank => (
                        <MenuItem key={bank._id} value={bank._id}>
                          {bank.bankName || bank.name || 'Bank'}
                        </MenuItem>
                      ))}
                    </Select>
                    {controller.errors.bank ? (
                      <FormHelperText>{controller.errors.bank.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              <CustomIconButton
                color="primary"
                size="medium"
                variant="tonal"
                skin="lighter"
                onClick={() => controller.setOpenBankModal(true)}
              >
                <Icon icon="mdi:bank-plus" width={24} />
              </CustomIconButton>
            </Box>

            <Controller
              name="referenceNo"
              control={controller.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="medium"
                  label="Reference No"
                  error={!!controller.errors.referenceNo}
                  helperText={controller.errors.referenceNo?.message}
                />
              )}
            />
          </Box>
        </Box>

        <Box className="flex flex-col gap-3">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>
            Notes & Terms
          </Typography>

          <Controller
            name="notes"
            control={controller.control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                size="medium"
                label="Notes"
                error={!!controller.errors.notes}
                helperText={controller.errors.notes?.message}
              />
            )}
          />

          <Controller
            name="termsAndCondition"
            control={controller.control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                size="medium"
                label="Terms & Conditions"
                error={!!controller.errors.termsAndCondition}
                helperText={controller.errors.termsAndCondition?.message}
              />
            )}
          />

          <Button
            fullWidth
            variant="text"
            color="primary"
            startIcon={<Icon icon="mdi:file-document-outline" width={22} />}
            onClick={controller.handleOpenTermsDialog}
          >
            Open Terms Editor
          </Button>
        </Box>

        <Box className="flex flex-col justify-evenly gap-2">
          <Box className="flex items-center justify-between">
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Held Invoices</Typography>
            <Chip
              label={heldInvoices.length}
              size="small"
              color="primary"
              variant="tonal"
              sx={{ fontWeight: 600, minWidth: 28 }}
            />
          </Box>
          <Box className="flex flex-col justify-evenly gap-2">
            {heldInvoices.length === 0 ? (
              <Box className="flex flex-col items-center justify-evenly gap-2 p-3 rounded-md border border-divider">
                <Icon icon="mdi:tray-alert" width={28} color={theme.palette.text.disabled} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  No held invoices
                </Typography>
              </Box>
            ) : (
              heldInvoices.map((invoice) => (
                <Box
                  key={invoice.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md border border-divider"
                >
                  <Box className="flex flex-1 flex-row items-center justify-between gap-3">
                    <Typography variant="overline" fontSize={13} fontWeight={500}>
                      Hold {String(invoice.holdNumber || invoice.id).padStart(2, '0')}
                    </Typography>
                    <Typography variant="body1" fontSize={14} fontWeight={500} color="text.secondary">
                      {invoice.items?.length || 0} items · {Number(invoice.total || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        onLoadHeldInvoice?.(invoice.id);
                        onClose();
                      }}
                    >
                      <Icon icon="mdi:play-circle-outline" width={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteHeldInvoice?.(invoice.id)}
                    >
                      <Icon icon="mdi:delete-outline" width={18} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default InvoiceOptionsDrawer;
