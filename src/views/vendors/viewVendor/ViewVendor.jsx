import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  FormLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import moment from 'moment';

import { getVendorById } from '@/app/(dashboard)/vendors/actions';
import { useViewVendorHandlers } from '@/handlers/vendors/viewVendor';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import { getBalanceColor } from '@/utils/colorUtils';

const ViewVendorDialog = ({ open, vendorId, defaultTab = 'details', onClose, onEdit, onError, onSuccess }) => {
  const theme = useTheme();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);

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
    formatCurrency  
  } = useViewVendorHandlers({
    vendorData: vendor,
    defaultTab,
    isDialog: true,
    onError,
    onSuccess
  });

  const tabValue = currentTab === 'details' ? 0 : 1;

  // Fetch vendor data when dialog opens
  useEffect(() => {
    const fetchVendor = async () => {
      if (open && vendorId) {
        setLoading(true);
        try {
          const vendorData = await getVendorById(vendorId);
          setVendor(vendorData);
        } catch (error) {
          onError?.(error.message || 'Failed to fetch vendor data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVendor();
  }, [open, vendorId, onError]);

  const handleClose = () => {
    setVendor(null);
    onClose();
  };

  const handleEditVendor = () => {
    if (vendor?._id && onEdit) {
      onEdit(vendor._id);
    }
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

  if (!open) return null;

  const statusOption = vendorStatusOptions.find(opt => opt.value === vendor?.status);

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        maxWidth='md'
        scroll='body'
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
        PaperProps={{ sx: { mt: { xs: 4, sm: 6 }, width: '100%' } }}
      >
        <DialogTitle
          variant='h4'
          className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
        >
          View Vendor
        </DialogTitle>

        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          {loading ? (
            <Box className="flex justify-center items-center h-40">
              <CircularProgress />
              <Typography className="ml-3">Loading vendor details...</Typography>
            </Box>
          ) : vendor ? (
            <>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Vendor Information" />
                  <Tab label="Ledger" />
                </Tabs>
              </Box>

              {/* Vendor Information Tab */}
              {tabValue === 0 && (
                <Box className="p-6">
                  <Grid container spacing={4}>
                    {/* Vendor Name */}
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Vendor Name"
                        value={vendor.vendor_name}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Email */}
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={vendor.vendor_email}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Phone */}
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={vendor.vendor_phone}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Current Balance */}
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Current Balance"
                        value={`${balance.amount} (${balance.type})`}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            
                              <Icon width={18} icon ='lucide:saudi-riyal' color={theme.palette.secondary.light} />
                         
                          ),
                        }}
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-input': {
                            color: balance.type === 'Credit' ? 'success.dark' : 'warning.dark',
                            fontWeight: 'medium'
                          }
                        }}
                      />
                    </Grid>

                     {/* Created Date */}
                     <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Created Date"
                        value={moment(vendor.created_at).format('DD MMM YYYY')}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>
                    

                    {/* Status */}
                    <Grid size={{xs:12, md:6}}>
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
                </Box>
              )}

              {/* Ledger Tab */}
              {tabValue === 1 && (
                <Box className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Ledger Entries</Typography>
                    <Button
                      variant="contained"
                      size='small'
                      startIcon={<i className='ri-add-line' />}
                      onClick={handleOpenLedgerDialog}
                    >
                      Add Entry
                    </Button>
                  </div>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="center">Mode</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Closing Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ledgerData.length > 0 ? (
                          ledgerData.map((entry) => (
                            <TableRow key={entry._id}>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{entry.reference || '-'}</TableCell>
                              <TableCell>
                                {moment(entry.date).format('DD MMM YYYY')}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  label={entry.mode}
                                  color={entry.mode === 'Credit' ? 'success' : 'error'}
                                  variant="tonal"
                                />
                              </TableCell>
                              <TableCell align="right">



                              <div className="flex items-center gap-1 min-w-[48px] justify-center">
      <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
      <Typography color={entry.mode === 'Credit' ? 'success.dark' : 'error.dark'}    className='text-[0.9rem] font-medium'>
        {Number(entry.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>
    </div>
                              </TableCell>
                              <TableCell align="right">


                              <div className="flex items-center gap-1 min-w-[48px] justify-center">
      <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
      <Typography  color={getBalanceColor(entry.runningBalance || 0)} className='text-[0.9rem] font-medium'>
        {Number(entry.runningBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>
    </div>
    
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Box className="py-8">
                                <Typography color="textSecondary" className="mb-2">
                                  No ledger entries found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Click "Add Entry" to create the first ledger entry
                                </Typography>
                              </Box>
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
                </Box>
              )}
            </>
          ) : (
            <Box className="flex justify-center items-center h-40">
              <Typography color="error">Vendor not found</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-16 pli-16 sm:pbe-10 sm:pli-16'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Close
          </Button>
       
        </DialogActions>
      </Dialog>

      {/* Add Ledger Entry Dialog */}
      <Dialog
        open={ledgerDialog}
        onClose={handleCloseLedgerDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          variant='h5'
          className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
        >
          Add Ledger Entry
        </DialogTitle>
        <form onSubmit={handleLedgerSubmit(handleLedgerFormSubmit)}>
          <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
            <IconButton onClick={handleCloseLedgerDialog} className='absolute block-start-4 inline-end-4' disabled={submittingLedger}>
              <i className='ri-close-line text-textSecondary' />
            </IconButton>

            <Grid container spacing={3}>
              <Grid size={{xs:12}}>
                <Controller
                  name="name"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Name"
                      placeholder="Enter Name"
                      error={!!ledgerErrors.name}
                      helperText={ledgerErrors.name?.message}
                      disabled={submittingLedger}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
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
                      disabled={submittingLedger}
                      value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="reference"
                  control={ledgerControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Reference (Optional)"
                      placeholder="Enter reference"
                      disabled={submittingLedger}
                    />
                  )}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="mode"
                  control={ledgerControl}
                  render={({ field }) => {
                    const selectedMode = ledgerModes.find(mode => mode.value === field.value);
                    
                    return (
                      <FormControl fullWidth error={!!ledgerErrors.mode}>
                        <InputLabel>Mode</InputLabel>
                        <Select
                          {...field} 
                          label="Mode" 
                          disabled={submittingLedger}
                          renderValue={(selected) => {
                            const mode = ledgerModes.find(m => m.value === selected);
                            if (mode) {
                              return (
                                <Chip
                                  label={mode.label}
                                  color={mode.color}
                                  variant="tonal"
                                  size="small"
                                />
                              );
                            }
                            return selected;
                          }}
                        >
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
                    );
                  }}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
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
                      disabled={submittingLedger}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon width={18} icon='lucide:saudi-riyal' color={theme.palette.secondary.light} />
                          </InputAdornment>
                        ),
                      }}
                      required
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
            <Button 
              variant='outlined' 
              color='secondary' 
              onClick={handleCloseLedgerDialog}
              disabled={submittingLedger}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant='contained'
              disabled={submittingLedger}
              startIcon={submittingLedger ? <CircularProgress size={20} /> : null}
            >
              {submittingLedger ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ViewVendorDialog;