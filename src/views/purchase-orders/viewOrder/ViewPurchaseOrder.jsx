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
import usePurchaseOrderViewHandlers from '@/handlers/purchaseOrders/usePurchaseOrderViewHandlers';

const ViewPurchaseOrder = ({ purchaseOrderData, onEdit, onDelete, onClone, onConvert, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();
  
  const handlers = usePurchaseOrderViewHandlers({
    purchaseOrderData,
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

  if (!purchaseOrderData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Purchase order not found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'draft':
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
                  Purchase Order
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {purchaseOrderData.purchaseOrderId}
                </Typography>
              </Box>
              {actionButtons}
            </Box>

            {/* Purchase Order Details */}
            <Grid container spacing={4}>
              {/* Left Column - Purchase Order Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Purchase Order Details
                  </Typography>
                  
                  <Box className='space-y-2'>
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                      <Typography variant="body2">{formatDate(purchaseOrderData.purchaseOrderDate)}</Typography>
                    </Box>
                    
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                      <Typography variant="body2">{formatDate(purchaseOrderData.dueDate)}</Typography>
                    </Box>
                    
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                      <Typography variant="body2">{purchaseOrderData.payment_method || 'N/A'}</Typography>
                    </Box>
                    
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Reference No:</Typography>
                      <Typography variant="body2">{purchaseOrderData.referenceNo || 'N/A'}</Typography>
                    </Box>
                    
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={purchaseOrderData.status || 'Pending'}
                        color={getStatusColor(purchaseOrderData.status)}
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
                      {purchaseOrderData.vendorDetails?.vendor_name || 'N/A'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {purchaseOrderData.vendorDetails?.email || ''}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {purchaseOrderData.vendorDetails?.phone || ''}
                    </Typography>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseOrderData.vendorDetails?.billingAddress?.address_line_1 || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseOrderData.vendorDetails?.billingAddress?.city || ''} {purchaseOrderData.vendorDetails?.billingAddress?.state || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseOrderData.vendorDetails?.billingAddress?.pincode || ''}
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
                    {purchaseOrderData.items?.map((item, index) => (
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
                  <Typography variant="body2">{formatCurrency(purchaseOrderData.taxableAmount)}</Typography>
                </Box>
                
                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">{formatCurrency(purchaseOrderData.totalDiscount)}</Typography>
                </Box>
                
                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">{formatCurrency(purchaseOrderData.vat)}</Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box className='flex justify-between py-2'>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(purchaseOrderData.TotalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Notes and Terms */}
            {(purchaseOrderData.notes || purchaseOrderData.termsAndCondition) && (
              <>
                <Divider sx={{ my: 4 }} />
                
                <Grid container spacing={4}>
                  {purchaseOrderData.notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseOrderData.notes}
                      </Typography>
                    </Grid>
                  )}
                  
                  {purchaseOrderData.termsAndCondition && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Terms & Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchaseOrderData.termsAndCondition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Signature */}
            {(purchaseOrderData.signatureImage || purchaseOrderData.signatureName) && (
              <>
                <Divider sx={{ my: 4 }} />
                
                <Box className='text-right'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Authorized Signature
                  </Typography>
                  
                  {purchaseOrderData.signatureImage && (
                    <Box className='mb-2'>
                      <img
                        src={purchaseOrderData.signatureImage}
                        alt="Signature"
                        style={{ maxHeight: '80px', maxWidth: '200px' }}
                      />
                    </Box>
                  )}
                  
                  {purchaseOrderData.signatureName && (
                    <Typography variant="body2" color="text.secondary">
                      {purchaseOrderData.signatureName}
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

export default ViewPurchaseOrder;