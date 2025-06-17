import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Pagination,
  FormLabel,
} from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { Controller } from 'react-hook-form';

import { getVendorById } from '@/app/(dashboard)/vendors/actions';
import { useViewVendorHandlers } from '@/handlers/vendors/viewVendor';

const ViewVendor = ({ id, onError, onSuccess }) => {
  const theme = useTheme();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    currentTab,
    handleTabChange,
    ledgerData,
    ledgerPagination,
    ledgerLoading,
    handleLedgerPageChange,
    ledgerDialog,
    handleOpenLedgerDialog,
    handleCloseLedgerDialog,
    ledgerControl,
    handleLedgerSubmit,
    ledgerErrors,
    watchMode,
    submittingLedger,
    handleLedgerFormSubmit,
    vendorStatusOptions,
    ledgerModes,
    amountFormat
  } = useViewVendorHandlers({
    vendorData: vendor,
    onError,
    onSuccess
  });

  const tabValue = currentTab === 'details' ? 0 : 1;

  // Fetch vendor data
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const vendorData = await getVendorById(id);
        setVendor(vendorData);
      } catch (error) {
        onError(error.message || 'Failed to fetch vendor data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id, onError]);

  const handleBack = () => {
    router.push('/vendors/vendor-list');
  };

  const calculateBalance = () => {
    if (!vendor || !ledgerData.length) {
      return {
        amount: vendor?.balance || 0,
        type: vendor?.balanceType || 'Credit'
      };
    }

    // Calculate balance from ledger entries
    let totalCredit = 0;
    let totalDebit = 0;

    ledgerData.forEach(entry => {
      if (entry.mode === 'Credit') {
        totalCredit += entry.amount;
      } else {
        totalDebit += entry.amount;
      }
    });

    const netAmount = totalCredit - totalDebit;
    return {
      amount: Math.abs(netAmount),
      type: netAmount >= 0 ? 'Credit' : 'Debit'
    };
  };

  const balance = calculateBalance();

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <Typography>Loading vendor details...</Typography>
      </Box>
    );
  }

  if (!vendor) {
    return (
      <Box className="flex justify-center items-center h-64">
        <Typography color="error">Vendor not found</Typography>
      </Box>
    );
  }

  const statusOption = vendorStatusOptions.find(opt => opt.value === vendor.status);

  return (
    <Box className="flex flex-col gap-6">
      {/* Header */}
      <Box className="flex items-center justify-between mb-2">
        <Box className="flex items-center gap-3">
          <CustomAvatar
            variant="rounded"
            color="primary"
            skin='light'
          >
            <Icon icon="mdi:account" width={28} />
          </CustomAvatar>
          <Typography variant="h5" className="font-semibold" color='primary.main'>
            {vendor.vendor_name}
          </Typography>
        </Box>
        <Button
          className='min-w-[120px]'
          variant="outlined"
          onClick={handleBack}
          startIcon={<Icon icon="mdi:arrow-left" />}
        >
          Back
        </Button>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Vendor Information" />
          <Tab label="Ledger" />
        </Tabs>

        {/* Vendor Information Tab */}
        {tabValue === 0 && (
          <CardContent className='flex flex-col gap-4'>
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Vendor Name
                  </FormLabel>
                  <Typography variant="body1" className="font-medium">
                    {vendor.vendor_name}
                  </Typography>
                </Box>
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Email Address
                  </FormLabel>
                  <Typography variant="body1" className="font-medium">
                    {vendor.vendor_email}
                  </Typography>
                </Box>
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Phone Number
                  </FormLabel>
                  <Typography variant="body1" className="font-medium">
                    {vendor.vendor_phone}
                  </Typography>
                </Box>
              </Grid>

              {/* Current Balance */}
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Current Balance
                  </FormLabel>
                  <Box className="flex items-center gap-2">
                    <Icon
                      icon="lucide:saudi-riyal"
                      color={balance.type === 'Credit' ? theme.palette.success.main : theme.palette.warning.main}
                    />
                    <Typography
                      variant="body1"
                      color={balance.type === 'Credit' ? 'success.main' : 'warning.main'}
                      className="font-semibold"
                    >
                      {amountFormat(balance.amount)} ({balance.type})
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Balance Type - Only show if balance exists */}
              {balance.amount > 0 && (
                <Grid item xs={6} sm={6} md={4}>
                  <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                    <FormLabel className='text-[0.8rem]'>
                      Balance Type
                    </FormLabel>
                    <Chip
                      size="small"
                      variant="tonal"
                      label={balance.type}
                      color={balance.type === 'Credit' ? 'success' : 'warning'}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </Grid>
              )}

              {/* Status */}
              <Grid item xs={6} sm={3} md={2}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Status
                  </FormLabel>
                  <Chip
                    size="small"
                    variant="tonal"
                    label={statusOption?.label || 'Unknown'}
                    color={statusOption?.color || 'default'}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Box>
              </Grid>

              {/* Created Date */}
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex flex-col gap-2 border border-Light rounded-md h-full py-2 px-3">
                  <FormLabel className='text-[0.8rem]'>
                    Created Date
                  </FormLabel>
                  <Typography variant="body1" className="font-medium">
                    {moment(vendor.created_at).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Ledger Tab */}
        {tabValue === 1 && (
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Ledger Entries</Typography>
              <Button
                variant="contained"
                startIcon={<Icon icon="mdi:plus" />}
                onClick={handleOpenLedgerDialog}
              >
                Add Entry
              </Button>
            </div>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="center">Mode</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading ledger entries...
                      </TableCell>
                    </TableRow>
                  ) : ledgerData.length > 0 ? (
                    ledgerData.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>
                          {moment(entry.date).format('DD MMM YYYY')}
                        </TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>{entry.reference || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={entry.mode}
                            color={entry.mode === 'Credit' ? 'success' : 'warning'}
                            variant="tonal"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={entry.mode === 'Credit' ? 'success.main' : 'warning.main'}
                            className="font-medium"
                          >
                            {amountFormat(entry.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No ledger entries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {ledgerPagination.total > ledgerPagination.limit && (
              <Box className="flex justify-center mt-4">
                <Pagination
                  count={Math.ceil(ledgerPagination.total / ledgerPagination.limit)}
                  page={ledgerPagination.page}
                  onChange={handleLedgerPageChange}
                />
              </Box>
            )}
          </CardContent>
        )}
      </Card>

      {/* Add Ledger Entry Dialog */}
      <Dialog
        open={ledgerDialog}
        onClose={handleCloseLedgerDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Ledger Entry</DialogTitle>
        <form onSubmit={handleLedgerSubmit(handleLedgerFormSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      placeholder="Enter description"
                      error={!!ledgerErrors.name}
                      helperText={ledgerErrors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!ledgerErrors.date}
                      helperText={ledgerErrors.date?.message}
                      value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="reference"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Reference (Optional)"
                      placeholder="Enter reference"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="mode"
                  control={ledgerControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!ledgerErrors.mode}>
                      <InputLabel>Mode</InputLabel>
                      <Select {...field} label="Mode">
                        {ledgerModes.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {ledgerErrors.mode && (
                        <FormHelperText>{ledgerErrors.mode.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Amount"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!ledgerErrors.amount}
                      helperText={ledgerErrors.amount?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="lucide:saudi-riyal" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLedgerDialog}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submittingLedger}>
              {submittingLedger ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ViewVendor;