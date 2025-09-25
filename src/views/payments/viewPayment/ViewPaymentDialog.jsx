import React, { useState, useEffect } from 'react';
import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Typography,
     Button,
     Grid,
     Box,
     IconButton,
     TextField,
     Skeleton,
     Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { formIcons } from '@/data/dataSets';
import { getPaymentDetails } from '@/app/(dashboard)/payments/actions';

const getStatusColor = (status) => {
     switch (status?.toLowerCase()) {
          case 'success':
               return 'success';
          case 'processing':
               return 'warning';
          case 'pending':
               return 'info';
          case 'cancelled':
               return 'error';
          default:
               return 'default';
     }
};

const ViewPaymentDialog = ({ open, paymentId, onClose, onEdit, onError, onSuccess }) => {
     const theme = useTheme();
     const [payment, setPayment] = useState(null);
     const [loading, setLoading] = useState(false);

     // Fetch payment data when dialog opens
     useEffect(() => {
          const fetchPayment = async () => {
               if (open && paymentId) {
                    setLoading(true);
                    try {
                         const paymentData = await getPaymentDetails(paymentId);
                         setPayment(paymentData);
                    } catch (error) {
                         onError?.(error.message || 'Failed to fetch payment data');
                    } finally {
                         setLoading(false);
                    }
               }
          };

          fetchPayment();
     }, [open, paymentId, onError]);

     const handleClose = () => {
          setPayment(null);
          onClose();
     };

     const handleEditPayment = () => {
          if (payment?._id && onEdit) {
               onEdit(payment._id);
          }
     };

     if (!open) return null;

     return (
          <Dialog
               fullWidth
               open={open}
               onClose={handleClose}
               maxWidth='md'
               scroll='body'
               sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
               PaperProps={{
                    sx: {
                         mt: { xs: 4, sm: 6 },
                         width: '100%',
                         minWidth: { xs: '90vw', sm: '600px', md: '800px' },
                         minHeight: { xs: '70vh', sm: '600px' }
                    }
               }}
          >
               <DialogTitle
                    variant='h4'
                    className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
               >
                    View Payment
               </DialogTitle>

               <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
                    <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
                         <i className='ri-close-line text-textSecondary' />
                    </IconButton>

                    {loading ? (
                         <Box className="p-6">
                              {/* Form Skeleton */}
                              <Grid container spacing={4}>
                                   {Array.from({ length: 8 }).map((_, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                             <Skeleton variant="rounded" height={56} />
                                        </Grid>
                                   ))}
                              </Grid>
                         </Box>
                    ) : payment ? (
                         <Box className="p-6">
                              <Grid container spacing={4}>
                                   {/* Payment Number */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Payment Number"
                                             value={payment.payment_number || ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'id')?.icon || 'mdi:identifier'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Customer */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Customer"
                                             value={payment.userId || payment.customerDetail?.name || 'N/A'}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'customer')?.icon || 'mdi:account-outline'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Invoice ID */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Invoice ID"
                                             value={payment.invoiceId || ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'invoice')?.icon || 'mdi:file-document-outline'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Amount */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Amount"
                                             value={`${Number(payment.amount || 0).toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2
                                             })} SAR`}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                                            width={23}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Payment Method */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Payment Method"
                                             value={payment.payment_method || ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'payment')?.icon || 'mdi:credit-card-outline'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Payment Date */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Payment Date"
                                             value={payment.date ? dayjs(payment.date).format('DD/MM/YYYY') : ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'date')?.icon || 'mdi:calendar-outline'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Status */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Box className="flex items-center">
                                             <TextField
                                                  fullWidth
                                                  label="Status"
                                                  value=""
                                                  InputProps={{
                                                       readOnly: true,
                                                       startAdornment: (
                                                            <Icon
                                                                 style={{ marginRight: '5px' }}
                                                                 icon={formIcons.find(icon => icon.value === 'status')?.icon || 'mdi:check-circle-outline'}
                                                                 width={25}
                                                                 color={theme.palette.secondary.light}
                                                            />
                                                       ),
                                                       endAdornment: (
                                                            <Chip
                                                                 label={payment.status || 'Unknown'}
                                                                 color={getStatusColor(payment.status)}
                                                                 size='small'
                                                                 variant='tonal'
                                                            />
                                                       ),
                                                  }}
                                                  variant="outlined"
                                             />
                                        </Box>
                                   </Grid>

                                   {/* Reference */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Reference"
                                             value={payment.reference || 'N/A'}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon={formIcons.find(icon => icon.value === 'reference')?.icon || 'mdi:text-box-outline'}
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Created At */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Created At"
                                             value={payment.createdAt ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm') : ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon="mdi:clock-outline"
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Updated At */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Updated At"
                                             value={payment.updatedAt ? dayjs(payment.updatedAt).format('DD/MM/YYYY HH:mm') : ''}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon="mdi:update"
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Invoice Amount */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Invoice Amount"
                                             value={`${Number(payment.invoiceAmount || 0).toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2
                                             })} SAR`}
                                             InputProps={{
                                                  readOnly: true,
                                                  startAdornment: (
                                                       <Icon
                                                            style={{ marginRight: '5px' }}
                                                            icon="mdi:file-document-outline"
                                                            width={25}
                                                            color={theme.palette.secondary.light}
                                                       />
                                                  ),
                                             }}
                                             variant="outlined"
                                        />
                                   </Grid>

                                   {/* Description */}
                                   {payment.description && (
                                        <Grid size={{ xs: 12 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Description"
                                                  value={payment.description}
                                                  InputProps={{
                                                       readOnly: true,
                                                       startAdornment: (
                                                            <Icon
                                                                 style={{ marginRight: '5px', alignSelf: 'flex-start', marginTop: '12px' }}
                                                                 icon="mdi:text-box-outline"
                                                                 width={25}
                                                                 color={theme.palette.secondary.light}
                                                            />
                                                       ),
                                                  }}
                                                  variant="outlined"
                                                  multiline
                                                  rows={3}
                                             />
                                        </Grid>
                                   )}
                              </Grid>
                         </Box>
                    ) : (
                         <Box className="flex justify-center items-center h-40">
                              <Typography color="error">Payment not found</Typography>
                         </Box>
                    )}
               </DialogContent>

               <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
                    <Button color='secondary' variant='outlined' onClick={handleClose}>
                         Close
                    </Button>
                    {payment && onEdit && (
                         <Button variant='contained' onClick={handleEditPayment}>
                              Edit Payment
                         </Button>
                    )}
               </DialogActions>
          </Dialog>
     );
};

export default ViewPaymentDialog;
