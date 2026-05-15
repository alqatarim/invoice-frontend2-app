'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import { vendorStatusOptions } from '@/data/dataSets';
import { useViewVendorHandler } from './handler';

const ViewVendorDialog = ({
  open,
  id,
  vendorId,
  initialVendorData = null,
  onClose,
  onError,
}) => {
  const theme = useTheme();
  const {
    balance,
    createdAt,
    handleClose,
    isOpen,
    loading,
    vendor,
  } = useViewVendorHandler({
    open,
    id,
    vendorId,
    initialVendorData,
    onClose,
    onError,
  });

  if (!isOpen) return null;

  const statusOption = vendorStatusOptions.find(option => option.value === vendor?.status);

  return (
    <Dialog
      fullWidth
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      scroll="body"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{ sx: { mt: { xs: 4, sm: 6 }, width: '100%' } }}
    >
      <DialogTitle
        variant="h4"
        className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16"
      >
        View Vendor
      </DialogTitle>

      <DialogContent className="overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12">
        <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4">
          <i className="ri-close-line text-textSecondary" />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading vendor details...</Typography>
          </Box>
        ) : vendor ? (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={vendor.vendor_name || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email Address"
                value={vendor.vendor_email || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={vendor.vendor_phone || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Current Balance"
                value={`${balance.formattedAmount} (${balance.type})`}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Icon width={18} icon="lucide:saudi-riyal" color={theme.palette.secondary.light} />
                  ),
                }}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    color: balance.textColor,
                    fontWeight: 'medium',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Created Date"
                value={createdAt}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <FormLabel className="text-sm mb-2 block">Status</FormLabel>
                <Chip
                  label={statusOption?.label || 'Unknown'}
                  color={statusOption?.color || 'default'}
                  variant="tonal"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Vendor not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="gap-2 justify-center pbs-0 pbe-16 pli-16 sm:pbe-10 sm:pli-16">
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVendorDialog;
