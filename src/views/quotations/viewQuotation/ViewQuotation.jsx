'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  Divider
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import dayjs from 'dayjs';
import { updateQuotationStatus } from '@/app/(dashboard)/quotations/actions';



const getStatusColor = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'SENT':
      return 'info';
    case 'EXPIRED':
      return 'warning';
    case 'DRAFTED':
      return 'secondary';
    case 'CONVERTED':
      return 'primary';
    default:
      return 'default';
  }
};

const statusOptions = [
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Drafted', value: 'DRAFTED' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Rejected', value: 'REJECTED' }
];

const ViewQuotation = ({ quotationData, unitsList, productsList, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const [actionsMenuAnchorEl, setActionsMenuAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isExpired = quotationData.due_date && dayjs(quotationData.due_date).isBefore(dayjs(), 'day');

  if (!quotationData) {
    return (
      <Box className="flex items-center justify-center h-96">
        <Typography variant="h6" color="text.secondary">
          Quotation not found
        </Typography>
      </Box>
    );
  }

  // Helper function to find product name by ID
  const getProductName = (productId) => {
    const product = productsList?.find(product => product._id === productId);
    return product?.name
  };

  // Helper function to find unit name by ID
  const getUnitName = (unitId) => {
    const unit = unitsList?.find(unit => unit._id === unitId);
    return unit?.name
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  const handleStatusChange = async (status) => {
    try {
      setIsLoading(true);
      const response = await updateQuotationStatus(quotationData._id, status);

      if (response.success) {
        enqueueSnackbar('Quotation status updated successfully!', { variant: 'success' });
        // Refresh the page to show updated status
        router.refresh();
      } else {
        throw new Error(response.message || 'Failed to update quotation status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Failed to update status: ' + error.message, { variant: 'error' });
    } finally {
      setIsLoading(false);
      handleStatusMenuClose();
    }
  };











  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF download functionality
    console.log('Download PDF');
  };

  const handleEdit = () => {
    router.push(`/quotations/quotation-edit/${quotationData._id}`);
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
      <Button
        variant="outlined"
        startIcon={<Icon icon="tabler:printer" width={20} />}
        onClick={handlePrint}
      >
        Print
      </Button>
      <Button
        variant="outlined"
        startIcon={<Icon icon="tabler:download" width={20} />}
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
                  Quotation
                </Typography>
                <Typography variant="h6" color="primary.main">
                  #{quotationData.quotation_id || ''}
                </Typography>
              </Box>
              {actionButtons}
            </Box>

            {/* Quotation Details */}
            <Grid container spacing={4}>
              {/* Left Column - Quotation Info */}
              <Grid item xs={12} md={6}>
                <Box className='mb-6'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quotation Details
                  </Typography>

                  <Box className='space-y-2'>
                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Creation Date:</Typography>
                      <Typography variant="body2">{formatDate(quotationData.quotation_date)}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Expiry Date:</Typography>
                      <Typography variant="body2">{formatDate(quotationData.due_date)}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                      <Typography variant="body2">{formatNumber(quotationData.TotalAmount)}</Typography>
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={quotationData.status}
                        color={getStatusColor(quotationData.status)}
                        size="small"
                      />
                    </Box>

                    <Box className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">Expired:</Typography>
                      <Chip
                        label={isExpired ? 'Yes' : 'No'}
                        color={isExpired ? 'error' : 'success'}
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
                    Customer Information
                  </Typography>

                  <Box className='space-y-2'>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotationData.customerId?.name || 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {quotationData.customerId?.email || ''}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {quotationData.customerId?.phone || ''}
                    </Typography>

                    {quotationData.customerId?.billingAddress && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {quotationData.customerId.billingAddress.addressLine1 || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {quotationData.customerId.billingAddress.city || ''} {quotationData.customerId.billingAddress.state || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {quotationData.customerId.billingAddress.pincode || ''}
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
                      <TableCell>Item</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">VAT</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotationData.items && quotationData.items.length > 0 ? (
                      quotationData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getProductName(item.productId)}
                            </Typography>
                          </TableCell>
                          <TableCell>{getUnitName(item.unit)}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatNumber(item.rate)}</TableCell>
                          <TableCell align="right">
                            {quotationData.discountType === '2'
                              ? `${item.discount}% (${formatNumber((item.discount / 100) * item.rate * item.quantity)})`
                              : `${formatNumber(item.discount)}`}
                          </TableCell>
                          <TableCell align="right">{item.tax}%</TableCell>
                          <TableCell align="right">{formatNumber(item.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Totals Section */}
            <Box className='flex justify-end mb-6'>
              <Box className='w-80'>
                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatNumber(quotationData.taxableAmount)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">-{formatNumber(quotationData.totalDiscount)}</Typography>
                </Box>

                <Box className='flex justify-between py-2'>
                  <Typography variant="body2">VAT:</Typography>
                  <Typography variant="body2">{formatNumber(quotationData.vat)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box className='flex justify-between py-2'>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatNumber(quotationData.TotalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>


            {/* Notes and Terms */}
            {(quotationData.notes || quotationData.termsAndCondition) && (
              <>
                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                  {quotationData.notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quotationData.notes}
                      </Typography>
                    </Grid>
                  )}

                  {quotationData.termsAndCondition && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Terms and Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quotationData.termsAndCondition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Signature */}
            {quotationData.signatureId?.signatureImage && (
              <>
                <Divider sx={{ my: 4 }} />

                <Box className='text-right'>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Authorized Signature
                  </Typography>

                  <Box className='mb-2'>
                    <img
                      src={quotationData.signatureId?.signatureImage || quotationData.signatureImage}
                      alt="Signature"
                      style={{ maxHeight: '80px', maxWidth: '200px' }}
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* Back Button */}
            <Box className='flex justify-start mt-6'>
              <Button
                variant="outlined"
                component={Link}
                href="/quotations/quotation-list"
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

export default ViewQuotation;
