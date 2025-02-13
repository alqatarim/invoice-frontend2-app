'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';

// Local formatters
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
};

const formatDate = (date) => {
  return dayjs(date).format('DD MMM YYYY');
};

const ViewPurchaseContent = ({ purchaseData, unitsList, onDelete }) => {
  const router = useRouter();
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const purchase = purchaseData?.data || {};

  const handleDelete = async () => {
    setLoading(true);
    try {
      const success = await onDelete(purchase._id);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Purchase deleted successfully',
          severity: 'success'
        });
        router.push('/purchases/purchase-list');
      } else {
        setSnackbar({
          open: true,
          message: 'Error deleting purchase',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting purchase',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusChip = (status) => {
    const statusMap = {
      PAID: { color: 'success', label: 'Paid' },
      PENDING: { color: 'warning', label: 'Pending' },
      CANCELLED: { color: 'error', label: 'Cancelled' }
    };

    const statusConfig = statusMap[status?.toUpperCase()] || { color: 'default', label: status };

    return (
      <Chip
        variant='tonal'
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const getUnitName = (unitId) => {
    if (!unitId) return '';
    const unit = unitsList?.find(item => item?._id === unitId);
    return unit?.name || unitId;
  };

  if (!purchase) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">No purchase data available</Typography>
      </Box>
    );
  }

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard purchase-page"
        sx={{
          width: '210mm',
          minHeight: '297mm',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{
          display: 'box',
          margin: '30px',
          padding: '0px',
          border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`,
          borderRadius: 1,
          height: 'calc(100% - 70px)',
          flex: 1,
        }}>
          <Grid
            container
            sx={{
              alignItems: 'start',
              display: 'flex',
              flexDirection: 'column',
              '& > *': { width: '100%' }
            }}
          >
            {/* Header Section */}
            <Grid item sx={{
              borderRadius: '4px 4px 0 0',
              backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075),
            }}>
              <Grid container className='flex justify-between p-4' mb={2}>
                <Grid item xs={2}>
                  <Grid container className='flex ' spacing={1}>
                    <Grid item xs={12} className='flex justify-center' >
                      <Image
                        src='/images/illustrations/objects/store-2.png'
                        alt="Company Logo"
                        width='80'
                        height='80'
                        priority
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography variant='h6' color='text.secondary'>
                        Store details
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={5}>
                  <Grid className='flex flex-row justify-center' container spacing={5}>
                    <Grid item xs={'auto'} sx={{ textAlign: 'right' }}>
                      <Typography variant='h6' color='text.secondary'>
                        Purchase No
                      </Typography>
                      <Typography variant='h6' color='text.secondary'>
                        Purchase date
                      </Typography>
                          <Typography variant='h6' color='text.secondary'>
                        Status
                      </Typography>
                    </Grid>
                    <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                      <Typography variant='h6' fontWeight={700}>
                        {purchase.purchaseId}
                      </Typography>
                      <Typography variant='h6' fontWeight={500}>
                        {formatDate(purchase.purchaseDate)}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {getStatusChip(purchase.status)}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Vendor Details Section */}
            <Grid item>
              <Grid container
                borderBottom={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                padding={4} mb={4} className='flex justify-between'>
                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                    Vendor Details:
                  </Typography>
                  <Typography className='text-[14px]'>{purchase.vendorId?.vendor_name}</Typography>
                  <Typography className='text-[14px]'>{purchase.vendorId?.vendor_email}</Typography>
                  <Typography className='text-[14px]'>{purchase.vendorId?.vendor_phone}</Typography>
                </Grid>

                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Grid container className='flex'>
                    <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                        Bank Details:
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container className='flex flex-row justify-center gap-3'>
                        <Grid item xs={5} sx={{ textAlign: 'right' }} className='flex flex-col gap-0.5'>
                          <Typography variant='body2'>Bank Name:</Typography>
                          <Typography variant='body2'>Account No:</Typography>
                          <Typography variant='body2'>Branch:</Typography>
                        </Grid>
                        <Grid item xs='auto' sx={{ textAlign: 'left' }} className='flex flex-col gap-0.5'>
                          <Typography className='text-[14px]' fontWeight={500}>{purchase.bank?.bankName}</Typography>
                          <Typography className='text-[14px]' fontWeight={500}>{purchase.bank?.accountNumber}</Typography>
                          <Typography className='text-[14px]' fontWeight={500}>{purchase.bank?.branch}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Items Table */}
            <Grid item padding={5}>
              <Box
                borderColor={(theme) => alpha(theme.palette.secondary.main, 0.15)}
                className='overflow-x-auto border rounded'
              >
                <Table
                  size='small'
                  sx={{
                    '& .MuiTableCell-root': {
                      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell className='!bg-transparent'>#</TableCell>
                      <TableCell className='!bg-transparent'>Product</TableCell>
                      <TableCell className='!bg-transparent'>Unit</TableCell>
                      <TableCell className='!bg-transparent'>Qty</TableCell>
                      <TableCell className='!bg-transparent'>Rate</TableCell>
                      <TableCell className='!bg-transparent'>Discount</TableCell>
                      <TableCell className='!bg-transparent'>Tax</TableCell>
                      <TableCell className='!bg-transparent'>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.rate)}</TableCell>
                        <TableCell>{formatCurrency(item.discountValue)}</TableCell>
                        <TableCell>{formatCurrency(item.tax)}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>

            {/* Totals Section */}
            <Grid item padding={5}>
              <Grid container spacing={4} className='justify-between'>
                <Grid item xs={7}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2">{purchase.notes}</Typography>
                </Grid>

                <Grid item xs={3.25}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} className='flex flex-col gap-0'>
                      <Grid container spacing={1} alignItems="center" justifyContent='space-between'>
                        <Grid item xs={6} className='flex flex-col gap-1' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[14px]' color="text.secondary">Subtotal:</Typography>
                          <Typography className='text-[14px]' color="text.secondary">Discount:</Typography>
                          <Typography className='text-[14px]' color="text.secondary">Tax:</Typography>
                        </Grid>
                        <Grid item xs={'auto'} className='flex flex-col gap-1' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[14px]'>{formatCurrency(purchase.taxableAmount)}</Typography>
                          <Typography className='text-[14px]'>{`(${formatCurrency(purchase.totalDiscount)})`}</Typography>
                          <Typography className='text-[14px]'>{formatCurrency(purchase.vat)}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} className='flex flex-col' sx={{ textAlign: 'center' }}>
                      <Divider sx={{ my: 1, borderColor: 'primary.info' }} />
                    </Grid>

                    <Grid item xs={12} className='flex flex-col gap-1.5' sx={{ textAlign: 'right' }}>
                      <Grid container spacing={1} justifyContent='space-between'>
                        <Grid item xs={6} className='flex flex-col gap-1.5' sx={{ textAlign: 'Right' }}>
                          <Typography className='text-[16px]' fontWeight={600} color="text.secondary">Total:</Typography>
                        </Grid>
                        <Grid item xs={'auto'} className='flex flex-col gap-1.5' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[16px]' fontWeight={600}>
                            {formatCurrency(purchase.roundOff ? purchase.TotalAmount : purchase.taxableAmount)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Signature Section */}
            {(purchase.signatureId?.signatureImage || purchase.signatureImage || purchase.signatureName) && (
              <Grid item padding={5}
                borderTop={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                sx={{ mt: 'auto' }}
              >
                <Box className="flex justify-end">
                  <Box className="flex flex-col items-end gap-2">
                    {(purchase.signatureId?.signatureImage || purchase.signatureImage) && (
                      <img
                        src={purchase.signatureId?.signatureImage || purchase.signatureImage}
                        alt="Signature"
                        style={{ maxWidth: '150px' }}
                      />
                    )}
                    {purchase.signatureName && (
                      <Typography variant="caption" color="textSecondary">
                        {purchase.signatureName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ViewPurchaseContent;