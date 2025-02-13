'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Card,
  CardContent,
  Popover
} from '@mui/material';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { expenseSchema } from '@/views/expenses/addExpense/ExpenseSchema';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/hooks/usePermission';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomIconButton from '@core/components/mui/CustomIconButton'
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const paymentModes = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Cheque', value: 'Cheque' }
];

const paymentStatuses = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const AddExpense = ({ enqueueSnackbar, closeSnackbar, expenseNumber, onSubmit }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const { data: session } = useSession();
  const canCreate = usePermission('expense', 'create');
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const submitButtonRef = useRef(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
    isValid
  } = useForm({
    resolver: yupResolver(expenseSchema),
      mode: 'onChange',
    defaultValues: {
      expenseId: expenseNumber,
      reference: '',
      amount: '',
      paymentMode: '',
      expenseDate: dayjs(),
      status: '',
    //   notes: '',
      attachment: null
    }
  });

  const handleError = (errors) => {
    closeSnackbar();

    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) return;

      Object.values(errors).forEach((error, index) => {
        enqueueSnackbar(error.message, {
            autoHideDuration: 5000,
          variant: 'error',
          preventDuplicate: true,
          key: `error-${index}-${Date.now()}`,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          }
        });
      });
    }, 200);
  };

  const handleConfirmClick = (event, data) => {
    setAnchorEl(event.currentTarget);
    setConfirmData(data);
  };

  const handleConfirmClose = () => {
    setAnchorEl(null);
    setConfirmData(null);
  };

  const handleConfirmSubmit = async () => {
    if (confirmData) {
      setSubmitting(true);
      try {
        await onSubmit(confirmData);
      } catch (error) {
        handleError({ submit: { message: error.message } });
      } finally {
        setSubmitting(false);
        handleConfirmClose();
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      closeSnackbar();

      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }

      data.filePreview = filePreview;
      // Use the actual submit button as anchor
      handleConfirmClick({ currentTarget: submitButtonRef.current }, data);
    } catch (error) {
      handleError({ submit: { message: error.message } });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue('attachment', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setValue('attachment', null);
      setFilePreview(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={4}>

        <Grid item xs={12} md={4}>
          <Typography color='primary' className='mb-4' variant="h5">Add Expense</Typography>
        </Grid>
        <Grid item xs={12}>

            <form onSubmit={handleSubmit(handleFormSubmit, handleError)}>


          <Card>
            <CardContent>

                <Grid container spacing={4}>


                  <Grid item xs={12} md={4}>
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
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="reference"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Reference"
                          error={!!errors.reference}
                          helperText={errors.reference?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={
                            <>
                              Amount
                              <span style={{ color: theme.palette.error.main }}> *</span>
                            </>
                          }
                          type="number"
                          error={!!errors.amount}
                          helperText={errors.amount?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.paymentMode}>
                      <InputLabel>
                        Payment Mode
                        <span style={{ color: theme.palette.error.main }}> *</span>
                      </InputLabel>
                      <Controller
                        name="paymentMode"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label={
                            <>
                              Payment Mode
                              <span style={{ color: theme.palette.error.main }}> *</span>
                            </>
                          }>
                            {paymentModes.map(mode => (
                              <MenuItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.paymentMode && (
                        <FormHelperText>{errors.paymentMode.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="expenseDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label={
                            <>
                              Expense Date
                              <span style={{ color: theme.palette.error.main }}> *</span>
                            </>
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.expenseDate,
                              helperText: errors.expenseDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>
                        Payment Status
                        <span style={{ color: theme.palette.error.main }}> *</span>
                      </InputLabel>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label={
                            <>
                              Payment Status
                              <span style={{ color: theme.palette.error.main }}> *</span>
                            </>
                          }>
                            {paymentStatuses.map(status => (
                              <MenuItem key={status.value} value={status.value}>
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Notes"
                          multiline
                          rows={4}
                          error={!!errors.notes}
                          helperText={errors.notes?.message}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} md={6}>
                    <input
                      type="file"
                      accept="*/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="attachment-input"
                      aria-label="Upload expense attachment"
                    />

                    {filePreview ? (
                      <CustomIconButton
                        aria-label="Attachment preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmClick(e, { ...watch(), filePreview });
                        }}
                        variant='outlined'
                        skin='light'
                        color={errors.attachment ? 'error' : 'primary'}
                        sx={{
                          height: '200px',
                          width: '100%',
                          maxWidth: '440px',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          p: 2
                        }}
                      >
                        <Icon
                          icon='mdi:close'
                          width="24"
                          height="24"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilePreview(null);
                            setValue('attachment', null);
                            document.getElementById('attachment-input').value = '';
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            cursor: 'pointer',
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '50%',
                            padding: 4,
                            boxShadow: theme.shadows[3],
                            zIndex: 1
                          }}
                          aria-label="Remove attachment"
                        />

                        {filePreview && filePreview.startsWith('data:image') ? (
                          <Box sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1.5
                          }}>
                            <Box sx={{
                              height: '140px',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <img
                                src={filePreview}
                                alt="Attachment preview"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '140px',
                                  objectFit: 'contain',
                                  borderRadius: '8px'
                                }}
                              />
                            </Box>
                            <Box sx={{
                              backgroundColor: theme.palette.background.paper,
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              maxWidth: '100%',
                              width: '100%',
                              mx: 2
                            }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  textAlign: 'center',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '400px',
                                  margin: '0 auto'
                                }}
                              >
                                {watch('attachment')?.name}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1.5
                          }}>
                            <Icon
                              width="60"
                              height="60"
                              icon='mdi:file-document-outline'
                              color={theme.palette.primary.main}
                            />
                            <Box sx={{
                              backgroundColor: theme.palette.background.paper,
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              maxWidth: '100%',
                              width: '100%',
                              mx: 2
                            }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  textAlign: 'center',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '400px',
                                  margin: '0 auto'
                                }}
                              >
                                {watch('attachment')?.name}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </CustomIconButton>
                    ) : (
                      <CustomIconButton
                        aria-label="Upload attachment"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('attachment-input').click();
                        }}
                        skin='light'
                        color={errors.attachment ? 'error' : 'primary'}
                        sx={{
                          height: '200px',
                          width: '100%',
                          maxWidth: '440px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5
                        }}>
                          <Icon
                            width="60"
                            height="60"
                            icon="line-md:upload-outline-loop"
                            color={theme.palette.primary.main}
                          />
                          <Typography variant="h5" color="primary.main">
                            Upload attachment
                          </Typography>
                          <Typography variant="subtitle1" >
                            Max size: 5MB
                          </Typography>
                        </Box>
                      </CustomIconButton>
                    )}

                    {errors.attachment && (
                      <FormHelperText error sx={{ mt: 1, textAlign: 'center' }}>
                        {errors.attachment.message}
                      </FormHelperText>
                    )}
                  </Grid>

                </Grid>




            </CardContent>
          </Card>


          <Grid item xs={12}>
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Link href="/expenses/expense-list" passHref>
                        <Button variant="outlined" color="secondary">
                          Cancel
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        ref={submitButtonRef}
                      >
                        {submitting ? <CircularProgress size={24} /> : 'Add Expense'}
                      </Button>
                    </Box>
                  </Grid>
    </form>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handleConfirmClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        p: 2,
                        backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
                        backdropFilter: 'blur(8px)',
                        boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                        width: 'auto',
                        border: `1px solid ${alpha(theme.palette.common.black, 0.01)}`,
                        mt: -1,
                      },
                    },
                  }}
                >
                  <Box className="p-2">
                    <Typography variant="h6" className="mb-3">
                      Are you sure you want to add expense?
                    </Typography>
                    <Box className="flex gap-2 justify-end">
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={handleConfirmClose}
                      >
                        No
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmSubmit}
                      >
                        Yes
                      </Button>
                    </Box>
                  </Box>
                </Popover>


        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default AddExpense;
