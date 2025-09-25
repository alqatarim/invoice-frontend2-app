import React, { useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import usePurchaseViewHandlers from '@/handlers/purchases/usePurchaseViewHandlers';

const ViewPurchase = ({ purchaseData, onEdit, onDelete, onClone, onConvert, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();

  const handlers = usePurchaseViewHandlers({
    purchaseData,
    onEdit,
    onDelete,
    onClone,
    onConvert,
    enqueueSnackbar,
    closeSnackbar,
  });

  const {
    handlePrint,
    handleDownloadPDF,
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    formatCurrency,
    formatDate,
  } = handlers;

  if (!purchaseData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Purchase not found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const actionButtons = (
    <Box className='flex flex-row gap-2'>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Icon icon="tabler:edit" width={20} />}
        onClick={handleEdit}
      >
        Edit
      </Button>

      <CustomIconButton
        variant="outlined"
        color="primary"
        onClick={handlePrint}
        size="medium"
      >
        <Icon icon="tabler:printer" width={20} />
      </CustomIconButton>

      <CustomIconButton
        variant="outlined"
        color="primary"
        onClick={handleDownloadPDF}
        size="medium"
      >
        <Icon icon="tabler:download" width={20} />
      </CustomIconButton>

      <CustomIconButton
        variant="outlined"
        color="secondary"
        onClick={handleClone}
        size="medium"
      >
        <Icon icon="tabler:copy" width={20} />
      </CustomIconButton>

      <CustomIconButton
        variant="outlined"
        color="success"
        onClick={handleConvert}
        size="medium"
      >
        <Icon icon="tabler:transform" width={20} />
      </CustomIconButton>

      <CustomIconButton
        variant="outlined"
        color="error"
        onClick={handleDelete}
        size="medium"
      >
        <Icon icon="tabler:trash" width={20} />
      </CustomIconButton>
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
                  Purchase
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {purchaseData.purchaseId}
                </Typography>
              </Box>
              {actionButtons}
            </Box>

            {/* Purchase Details */}
            <Grid container spacing={4}>
              {/* Left Column - Purchase Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Purchase Details
                  </Typography>

                  <Box className='space-y-2'>
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Purchase Date:</Typography>
                      <Typography variant="body2">{formatDate(purchaseData.purchaseDate)}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                      <Typography variant="body2">{formatDate(purchaseData.dueDate)}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                      <Typography variant="body2">{purchaseData.payment_method || 'N/A'}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Reference No:</Typography>
                      <Typography variant="body2">{purchaseData.referenceNo || 'N/A'}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Supplier Invoice #:</Typography>
                      <Typography variant="body2">{purchaseData.supplierInvoiceSerialNumber || 'N/A'}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={purchaseData.status || 'Pending'}
                        color={getStatusColor(purchaseData.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Vendor Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Vendor Information
                  </Typography>

                  <Box className='space-y-2'>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {purchaseData.vendorDetails?.vendor_name || 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {purchaseData.vendorDetails?.email || ''}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {purchaseData.vendorDetails?.phone || ''}
                    </Typography>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseData.vendorDetails?.billingAddress?.address_line_1 || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseData.vendorDetails?.billingAddress?.city || ''} {purchaseData.vendorDetails?.billingAddress?.state || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseData.vendorDetails?.billingAddress?.pincode || ''}
                      </Typography>
                    </Box>
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
                      <TableCell>Product/Service</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Unit</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseData.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
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
                  <Typography variant="body2">{formatCurrency(purchaseData.taxableAmount)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">{formatCurrency(purchaseData.totalDiscount)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">{formatCurrency(purchaseData.vat)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box className='flex justify-between py-2'>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(purchaseData.TotalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Notes and Terms */}
            {(purchaseData.notes || purchaseData.termsAndCondition) && (
              <>
                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                  {purchaseData.notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseData.notes}
                      </Typography>
                    </Grid>
                  )}

                  {purchaseData.termsAndCondition && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Terms & Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseData.termsAndCondition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Signature */}
            {(purchaseData.signatureImage || purchaseData.signatureName) && (
              <>
                <Divider sx={{ my: 4 }} />

                <Box className='text-right'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Authorized Signature
                  </Typography>

                  {purchaseData.signatureImage && (
                    <Box className='mb-2'>
                      <img
                        src={purchaseData.signatureImage}
                        alt="Signature"
                        style={{ maxHeight: '80px', maxWidth: '200px' }}
                      />
                    </Box>
                  )}

                  {purchaseData.signatureName && (
                    <Typography variant="body2" color="text.secondary">
                      {purchaseData.signatureName}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ViewPurchase;