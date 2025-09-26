'use client';

import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  TableContainer,
  Chip,
} from '@mui/material';
import { Print, Download, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/currencyUtils';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';

const ViewDeliveryChallan = ({ deliveryChallanData, isLoading }) => {
  const contentRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();
  const canEdit = usePermission('deliveryChallan', 'update');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!deliveryChallanData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Delivery challan not found
        </Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    router.push(`/deliveryChallans/deliveryChallans-edit/${deliveryChallanData._id}`);
  };

  const handleDownloadPDF = () => {
    // PDF download functionality
    console.log('Download PDF');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'converted':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const actionButtons = (
    <Box className='flex flex-row gap-2'>
      {canEdit && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      )}
      <Button
        variant="outlined"
        startIcon={<Print />}
        onClick={handlePrint}
      >
        Print
      </Button>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleDownloadPDF}
      >
        Download
      </Button>
    </Box>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box className='flex flex-row justify-between items-start mb-6'>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  Delivery Challan
                </Typography>
                <Typography variant="h6" color="primary.main">
                  #{deliveryChallanData?.deliveryChallanNumber}
                </Typography>
              </Box>
              {actionButtons}
            </Box>

            {/* Delivery Challan Details */}
            <Grid container spacing={4}>
              {/* Left Column - Challan Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Delivery Challan Details
                  </Typography>

                  <Box className='space-y-2'>
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Challan Date:</Typography>
                      <Typography variant="body2">{dayjs(deliveryChallanData?.deliveryChallanDate).format('DD MMM YYYY')}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                      <Typography variant="body2">{deliveryChallanData?.dueDate ? dayjs(deliveryChallanData?.dueDate).format('DD MMM YYYY') : 'N/A'}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Reference No:</Typography>
                      <Typography variant="body2">{deliveryChallanData?.referenceNo || 'N/A'}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={deliveryChallanData?.status || 'Active'}
                        color={getStatusColor(deliveryChallanData?.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Customer Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Delivery Information
                  </Typography>

                  <Box className='space-y-2'>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deliveryChallanData?.customerId?.name || 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {deliveryChallanData?.customerId?.email || ''}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {deliveryChallanData?.customerId?.phone || ''}
                    </Typography>

                    {deliveryChallanData?.deliveryAddress && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {deliveryChallanData.deliveryAddress.addressLine1 || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {deliveryChallanData.deliveryAddress.city || ''} {deliveryChallanData.deliveryAddress.state || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {deliveryChallanData.deliveryAddress.pincode || ''}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Items Table */}
            <Box className='mb-6'>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Items
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableRow>
                      <TableCell>Item & Description</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Unit</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryChallanData?.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.units || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell align="right">
                          {item.discountType === 2 ?
                            `${item.discount}%` :
                            formatCurrency(item.discount)
                          }
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.tax)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Totals Section */}
            <Box className='flex justify-end mb-6'>
              <Box className='w-80'>
                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(deliveryChallanData?.taxableAmount || 0)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">-{formatCurrency(deliveryChallanData?.totalDiscount || 0)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">{formatCurrency(deliveryChallanData?.vat || 0)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box className='flex justify-between py-2'>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(deliveryChallanData?.TotalAmount || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Notes and Terms */}
            {(deliveryChallanData?.notes || deliveryChallanData?.termsAndCondition) && (
              <>
                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                  {deliveryChallanData?.notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {deliveryChallanData.notes}
                      </Typography>
                    </Grid>
                  )}

                  {deliveryChallanData?.termsAndCondition && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Terms & Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {deliveryChallanData.termsAndCondition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Signature */}
            {deliveryChallanData?.signatureImage && (
              <>
                <Divider sx={{ my: 4 }} />

                <Box className='text-right'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Authorized Signature
                  </Typography>

                  <Box className='mb-2'>
                    <img
                      src={deliveryChallanData.signatureImage}
                      alt="Signature"
                      style={{ maxHeight: '80px', maxWidth: '200px' }}
                    />
                  </Box>

                  {deliveryChallanData?.signatureName && (
                    <Typography variant="body2" color="text.secondary">
                      {deliveryChallanData.signatureName}
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {/* Back Button */}
            <Box className='flex justify-start mt-6'>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                startIcon={<Icon icon="tabler:arrow-left" />}
              >
                Back to List
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ViewDeliveryChallan;