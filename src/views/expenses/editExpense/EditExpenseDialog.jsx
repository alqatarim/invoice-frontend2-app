import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     TextField,
     Button,
     Grid,
     FormHelperText,
     FormControl,
     InputLabel,
     Select,
     MenuItem,
     Box,
     CircularProgress,
     Typography,
     Skeleton,
} from '@mui/material';
import IconButton from '@core/components/mui/CustomOriginalIconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getExpenseDetails } from '@/app/(dashboard)/expenses/actions';
import { useEditExpenseHandlers } from '@/handlers/expenses/editExpense/useEditExpenseHandlers';
import { formIcons } from '@/data/dataSets';
import { getNameFromPath } from '@/utils/fileUtils';

const paymentModes = [
     { label: 'Cash', value: 'Cash' },
     { label: 'Cheque', value: 'Cheque' }
];

const paymentStatuses = [
     { label: 'Paid', value: 'Paid' },
     { label: 'Pending', value: 'Pending' },
     { label: 'Cancelled', value: 'Cancelled' }
];

const EditExpenseDialog = ({ open, expenseId, onClose, onSave }) => {
     const theme = useTheme();
     const [expenseData, setExpenseData] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const {
          control,
          handleSubmit,
          watch,
          errors,
          isSubmitting,
          handleFormSubmit,
          imagePreview,
          selectedFile,
          imageError,
          handleImageChange,
          handleImageError,
          handleImageDelete,
          isDragging,
          handleDragEnter,
          handleDragLeave,
          handleDragOver,
          handleDrop,
     } = useEditExpenseHandlers({
          expenseData: expenseData || null,
          onSave: async (data, preparedAttachment) => {
               const result = await onSave(expenseId, data, preparedAttachment);
               if (result.success) {
                    onClose();
               }
               return result;
          },
     });

     // Fetch expense data when dialog opens
     useEffect(() => {
          const fetchData = async () => {
               if (open && expenseId) {
                    setLoading(true);
                    setError(null);
                    try {
                         const expenseResponse = await getExpenseDetails(expenseId);

                         if (expenseResponse && typeof expenseResponse === 'object') {
                              setExpenseData(expenseResponse);
                         } else {
                              throw new Error('Invalid expense data received');
                         }
                    } catch (error) {
                         console.error('Failed to fetch expense data:', error);
                         setError(error.message || 'Failed to load expense data');
                         setExpenseData(null);
                    } finally {
                         setLoading(false);
                    }
               }
          };

          fetchData();
     }, [open, expenseId]);

     const handleClose = () => {
          setExpenseData(null);
          setError(null);
          onClose();
     };

     if (!open) return null;

     return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                         Edit Expense
                    </DialogTitle>

                    <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
                         <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
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
                         ) : error ? (
                              <Box className="flex flex-col justify-center items-center h-40 gap-4">
                                   <Typography color="error" variant="h6">Error Loading Expense</Typography>
                                   <Typography color="error">{error}</Typography>
                                   <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                             setError(null);
                                             // Trigger refetch
                                             const fetchData = async () => {
                                                  if (open && expenseId) {
                                                       setLoading(true);
                                                       setError(null);
                                                       try {
                                                            const expenseResponse = await getExpenseDetails(expenseId);

                                                            if (expenseResponse && typeof expenseResponse === 'object') {
                                                                 setExpenseData(expenseResponse);
                                                            } else {
                                                                 throw new Error('Invalid expense data received');
                                                            }
                                                       } catch (error) {
                                                            console.error('Failed to fetch expense data:', error);
                                                            setError(error.message || 'Failed to load expense data');
                                                            setExpenseData(null);
                                                       } finally {
                                                            setLoading(false);
                                                       }
                                                  }
                                             };
                                             fetchData();
                                        }}
                                   >
                                        Retry
                                   </Button>
                              </Box>
                         ) : expenseData ? (
                              <Box className="p-6">
                                   {/* Attachment Upload - Social Media Style - Top Center */}
                                   <Box className="flex justify-center mb-6">
                                        <Controller
                                             name="attachment"
                                             control={control}
                                             render={({ field: { onChange, value } }) => (
                                                  <Box>
                                                       {imagePreview ? (
                                                            // Attachment Preview with Social Media Style Controls
                                                            <Box
                                                                 sx={{
                                                                      position: 'relative',
                                                                      display: 'inline-block',
                                                                      borderRadius: 2,
                                                                      overflow: 'hidden',
                                                                      border: '1px solid',
                                                                      borderColor: 'divider',
                                                                      backgroundColor: 'background.paper',
                                                                      width: { xs: '280px', sm: '320px', md: '350px' },
                                                                      height: '200px'
                                                                 }}
                                                            >
                                                                 <Box
                                                                      sx={{
                                                                           position: 'relative',
                                                                           display: 'flex',
                                                                           justifyContent: 'center',
                                                                           alignItems: 'center',
                                                                           backgroundColor: 'grey.50',
                                                                           width: '100%',
                                                                           height: '100%'
                                                                      }}
                                                                 >
                                                                      {imagePreview.startsWith('data:image') || (typeof imagePreview === 'string' && imagePreview.includes('image')) ? (
                                                                           <img
                                                                                src={imagePreview}
                                                                                alt={expenseData?.expenseDetails?.expenseId || 'Expense'}
                                                                                style={{
                                                                                     width: '100%',
                                                                                     height: '100%',
                                                                                     objectFit: 'contain',
                                                                                     objectPosition: 'center',
                                                                                     borderRadius: 'inherit',
                                                                                     display: 'block'
                                                                                }}
                                                                                onError={handleImageError}
                                                                           />
                                                                      ) : (
                                                                           <Box sx={{ textAlign: 'center' }}>
                                                                                <Icon icon="mdi:file-document-outline" width={60} color={theme.palette.primary.main} />
                                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                                     {getNameFromPath(imagePreview, selectedFile)}
                                                                                </Typography>
                                                                           </Box>
                                                                      )}

                                                                      {/* Overlay Actions */}
                                                                      <Box
                                                                           sx={{
                                                                                position: 'absolute',
                                                                                top: 8,
                                                                                right: 8,
                                                                                display: 'flex',
                                                                                gap: 1,
                                                                                opacity: 1
                                                                           }}
                                                                      >
                                                                           {/* Replace Button */}
                                                                           <IconButton
                                                                                variant="contained"
                                                                                size="small"
                                                                                color="primary"
                                                                                disabled={isSubmitting}
                                                                                onClick={() => {
                                                                                     const fileInput = document.querySelector('#replace-attachment-input');
                                                                                     if (fileInput) {
                                                                                          fileInput.click();
                                                                                     }
                                                                                }}
                                                                           >
                                                                                <Icon icon="mdi:cloud-upload-outline" />
                                                                                <input
                                                                                     id="replace-attachment-input"
                                                                                     type="file"
                                                                                     hidden
                                                                                     accept="*/*"
                                                                                     onChange={(e) => {
                                                                                          handleImageChange(e);
                                                                                          const file = e.target.files[0];
                                                                                          if (file) {
                                                                                               onChange(file);
                                                                                          }
                                                                                     }}
                                                                                />
                                                                           </IconButton>

                                                                           {/* Delete Button */}
                                                                           <IconButton
                                                                                size="small"
                                                                                onClick={handleImageDelete}
                                                                                disabled={isSubmitting}
                                                                                color="error"
                                                                                variant="contained"
                                                                           >
                                                                                <Icon icon="mdi:delete-outline" />
                                                                           </IconButton>
                                                                      </Box>
                                                                 </Box>
                                                            </Box>
                                                       ) : (
                                                            // Upload Area - Social Media Style with Drag & Drop
                                                            <Box
                                                                 component="label"
                                                                 onDragEnter={handleDragEnter}
                                                                 onDragLeave={handleDragLeave}
                                                                 onDragOver={handleDragOver}
                                                                 onDrop={(e) => {
                                                                      handleDrop(e);
                                                                      const file = e.dataTransfer.files[0];
                                                                      if (file) {
                                                                           onChange(file);
                                                                      }
                                                                 }}
                                                                 sx={{
                                                                      width: { xs: '200px', sm: '200px', md: '200px' },
                                                                      height: '200px',
                                                                      display: 'flex',
                                                                      flexDirection: 'column',
                                                                      justifyContent: 'center',
                                                                      alignItems: 'center',
                                                                      cursor: 'pointer',
                                                                      border: '2px dashed',
                                                                      borderColor: isDragging ? 'primary.main' : 'secondary.light',
                                                                      borderRadius: 2,
                                                                      backgroundColor: isDragging ? 'primary.lighter' : '',
                                                                      transition: 'all 0.2s ease-in-out',
                                                                      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                                                                      '&:hover': {
                                                                           borderColor: 'primary.main',
                                                                           backgroundColor: theme.palette.primary.lightOpacity,
                                                                           transform: 'scale(1.04)'
                                                                      }
                                                                 }}
                                                            >
                                                                 <Icon
                                                                      icon={isDragging ? "mdi:download" : "mdi:cloud-upload-outline"}
                                                                      width={48}
                                                                      color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                                                                      style={{ marginBottom: 12, pointerEvents: 'none' }}
                                                                 />
                                                                 <Typography
                                                                      variant="body2"
                                                                      color={isDragging ? "primary" : "text.primary"}
                                                                      fontWeight={500}
                                                                      sx={{ pointerEvents: 'none' }}
                                                                 >
                                                                      {isDragging ? "Drop attachment here" : "Click or drag to Upload Attachment"}
                                                                 </Typography>
                                                                 <Typography
                                                                      variant="caption"
                                                                      color="text.secondary"
                                                                      className="text-center mt-1"
                                                                      sx={{ pointerEvents: 'none' }}
                                                                 >
                                                                      Any file up to 5MB
                                                                 </Typography>
                                                                 <input
                                                                      type="file"
                                                                      hidden
                                                                      accept="*/*"
                                                                      onChange={(e) => {
                                                                           handleImageChange(e);
                                                                           const file = e.target.files[0];
                                                                           if (file) {
                                                                                onChange(file);
                                                                           }
                                                                      }}
                                                                 />
                                                            </Box>
                                                       )}

                                                       {/* Error Message */}
                                                       {imageError && (
                                                            <Typography variant="caption" color="error" className='block mt-2 text-center'>
                                                                 <Icon icon="mdi:alert-circle" width={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                                 {imageError}
                                                            </Typography>
                                                       )}
                                                  </Box>
                                             )}
                                        />
                                   </Box>

                                   <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-expense-form">
                                        <Grid container spacing={4}>
                                             {/* Expense ID */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="expenseId"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Expense ID"
                                                                 error={!!errors.expenseId}
                                                                 helperText={errors.expenseId?.message}
                                                                 disabled
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'id')?.icon || 'mdi:identifier'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      ),
                                                                 }}
                                                                 variant="outlined"
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Reference */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="reference"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Reference"
                                                                 placeholder="Enter reference"
                                                                 error={!!errors.reference}
                                                                 helperText={errors.reference?.message}
                                                                 disabled={isSubmitting}
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'reference')?.icon || 'mdi:text-box-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      ),
                                                                 }}
                                                                 variant="outlined"
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Amount */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="amount"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 type="number"
                                                                 label="Amount"
                                                                 placeholder="0.00"
                                                                 error={!!errors.amount}
                                                                 helperText={errors.amount?.message}
                                                                 disabled={isSubmitting}
                                                                 required
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                                                                width={21}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      ),
                                                                 }}
                                                                 variant="outlined"
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Payment Mode */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="paymentMode"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <FormControl fullWidth error={!!errors.paymentMode} required>
                                                                 <InputLabel>Payment Mode</InputLabel>
                                                                 <Select
                                                                      {...field}
                                                                      label="Payment Mode"
                                                                      disabled={isSubmitting}
                                                                      startAdornment={
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'payment')?.icon || 'mdi:credit-card-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      }
                                                                 >
                                                                      {paymentModes.map((mode) => (
                                                                           <MenuItem key={mode.value} value={mode.value}>
                                                                                {mode.label}
                                                                           </MenuItem>
                                                                      ))}
                                                                 </Select>
                                                                 {errors.paymentMode && <FormHelperText>{errors.paymentMode.message}</FormHelperText>}
                                                            </FormControl>
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Expense Date */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="expenseDate"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <DatePicker
                                                                 {...field}
                                                                 label="Expense Date"
                                                                 disabled={isSubmitting}
                                                                 slotProps={{
                                                                      textField: {
                                                                           fullWidth: true,
                                                                           error: !!errors.expenseDate,
                                                                           helperText: errors.expenseDate?.message,
                                                                           required: true,
                                                                           InputProps: {
                                                                                startAdornment: (
                                                                                     <Icon
                                                                                          style={{ marginRight: '5px' }}
                                                                                          icon={formIcons.find(icon => icon.value === 'date')?.icon || 'mdi:calendar-outline'}
                                                                                          width={23}
                                                                                          color={theme.palette.secondary.light}
                                                                                     />
                                                                                ),
                                                                           },
                                                                      }
                                                                 }}
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Payment Status */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="status"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <FormControl fullWidth error={!!errors.status} required>
                                                                 <InputLabel>Payment Status</InputLabel>
                                                                 <Select
                                                                      {...field}
                                                                      label="Payment Status"
                                                                      disabled={isSubmitting}
                                                                      startAdornment={
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'status')?.icon || 'mdi:check-circle-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      }
                                                                 >
                                                                      {paymentStatuses.map((status) => (
                                                                           <MenuItem key={status.value} value={status.value}>
                                                                                {status.label}
                                                                           </MenuItem>
                                                                      ))}
                                                                 </Select>
                                                                 {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                                            </FormControl>
                                                       )}
                                                  />
                                             </Grid>
                                        </Grid>
                                   </form>
                              </Box>
                         ) : (
                              <Box className="flex justify-center items-center h-40">
                                   <Typography color="error">Failed to load expense data</Typography>
                              </Box>
                         )}
                    </DialogContent>

                    <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
                         <Button
                              variant='outlined'
                              color='secondary'
                              onClick={handleClose}
                              disabled={isSubmitting}
                         >
                              Cancel
                         </Button>
                         <Button
                              type="submit"
                              form="edit-expense-form"
                              variant='contained'
                              disabled={isSubmitting || loading || !expenseData}
                              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                         >
                              {isSubmitting ? 'Updating...' : 'Update Expense'}
                         </Button>
                    </DialogActions>
               </Dialog>
          </LocalizationProvider>
     );
};

export default EditExpenseDialog;
