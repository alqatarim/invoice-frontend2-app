import React, { useState, useEffect } from 'react';
import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Typography,
     Button,
     Box,
     IconButton,
     CircularProgress,
     TextField,
     Skeleton,
     Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { formIcons } from '@/data/dataSets';
import { getExpenseDetails } from '@/app/(dashboard)/expenses/actions';

const ViewExpenseDialog = ({ open, expenseId, onClose, onEdit, onError, onSuccess }) => {
     const theme = useTheme();
     const [expense, setExpense] = useState(null);
     const [loading, setLoading] = useState(false);

     // Fetch expense data when dialog opens
     useEffect(() => {
          const fetchExpense = async () => {
               if (open && expenseId) {
                    setLoading(true);
                    try {
                         const expenseData = await getExpenseDetails(expenseId);
                         setExpense(expenseData);
                    } catch (error) {
                         onError?.(error.message || 'Failed to fetch expense data');
                    } finally {
                         setLoading(false);
                    }
               }
          };

          fetchExpense();
     }, [open, expenseId, onError]);

     const handleClose = () => {
          setExpense(null);
          onClose();
     };

     const handleEditExpense = () => {
          if (expense?.expenseDetails?._id && onEdit) {
               onEdit(expense.expenseDetails._id);
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
                    View Expense
               </DialogTitle>

               <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
                    <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
                         <i className='ri-close-line text-textSecondary' />
                    </IconButton>

                    {loading ? (
                         <Box className="p-6">
                              {/* Attachment Skeleton */}
                              <Box className="flex justify-center mb-6">
                                   <Skeleton
                                        variant="rectangular"
                                        sx={{
                                             width: '200px',
                                             height: '200px',
                                             borderRadius: 2
                                        }}
                                   />
                              </Box>

                              {/* Form Skeleton */}
                              <Grid container spacing={4}>
                                   {Array.from({ length: 6 }).map((_, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                             <Skeleton variant="rounded" height={56} />
                                        </Grid>
                                   ))}
                              </Grid>
                         </Box>
                    ) : expense ? (
                         <Box className="p-6">
                              {/* Expense Attachment */}
                              {expense.expenseDetails?.attachment && (
                                   <Box className="flex justify-center mb-6">
                                        <Box
                                             sx={{
                                                  width: { xs: '280px', sm: '320px', md: '350px' },
                                                  height: '200px',
                                                  display: 'flex',
                                                  justifyContent: 'center',
                                                  alignItems: 'center',
                                                  backgroundColor: 'grey.50',
                                                  borderRadius: 2,
                                                  border: '1px solid',
                                                  borderColor: 'divider',
                                                  overflow: 'hidden'
                                             }}
                                        >
                                             {expense.expenseDetails.attachment.includes('image') ? (
                                                  <img
                                                       src={expense.expenseDetails.attachment}
                                                       alt={expense.expenseDetails?.expenseId || 'Expense'}
                                                       style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            objectPosition: 'center'
                                                       }}
                                                  />
                                             ) : (
                                                  <Box sx={{ textAlign: 'center' }}>
                                                       <Icon icon="mdi:file-document-outline" width={60} color={theme.palette.primary.main} />
                                                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            Attachment Available
                                                       </Typography>
                                                  </Box>
                                             )}
                                        </Box>
                                   </Box>
                              )}

                              <Grid container spacing={4}>
                                   {/* Expense ID */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Expense ID"
                                             value={expense.expenseDetails?.expenseId || ''}
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

                                   {/* Reference */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Reference"
                                             value={expense.expenseDetails?.reference || ''}
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

                                   {/* Amount */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Amount"
                                             value={`${Number(expense.expenseDetails?.amount || 0).toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2
                                             })}`}
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

                                   {/* Payment Mode */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Payment Mode"
                                             value={expense.expenseDetails?.paymentMode || ''}
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

                                   {/* Expense Date */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Expense Date"
                                             value={expense.expenseDetails?.expenseDate ? dayjs(expense.expenseDetails.expenseDate).format('DD/MM/YYYY') : ''}
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

                                   {/* Payment Status */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Payment Status"
                                             value={expense.expenseDetails?.status || ''}
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
                                             }}
                                             variant="outlined"
                                             sx={expense.expenseDetails?.status === 'Pending' ? {
                                                  '& .MuiInputBase-input': {
                                                       color: 'warning.main',
                                                  }
                                             } : expense.expenseDetails?.status === 'Cancelled' ? {
                                                  '& .MuiInputBase-input': {
                                                       color: 'error.main',
                                                  }
                                             } : {
                                                  '& .MuiInputBase-input': {
                                                       color: 'success.main',
                                                  }
                                             }}
                                        />
                                   </Grid>

                                   {/* Created At */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                             fullWidth
                                             label="Created At"
                                             value={expense.expenseDetails?.createdAt ? dayjs(expense.expenseDetails.createdAt).format('DD/MM/YYYY HH:mm') : ''}
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
                                             value={expense.expenseDetails?.updatedAt ? dayjs(expense.expenseDetails.updatedAt).format('DD/MM/YYYY HH:mm') : ''}
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
                              </Grid>
                         </Box>
                    ) : (
                         <Box className="flex justify-center items-center h-40">
                              <Typography color="error">Expense not found</Typography>
                         </Box>
                    )}
               </DialogContent>

               <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
                    <Button color='secondary' variant='outlined' onClick={handleClose}>
                         Close
                    </Button>
                    {expense && onEdit && (
                         <Button variant='contained' onClick={handleEditExpense}>
                              Edit Expense
                         </Button>
                    )}
               </DialogActions>
          </Dialog>
     );
};

export default ViewExpenseDialog;
