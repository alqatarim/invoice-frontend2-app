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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/helpers';
import dayjs from 'dayjs';
import { deleteQuotation, convertToInvoice, updateQuotationStatus } from '@/app/(dashboard)/quotations/actions';

// Helper functions
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

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

const ViewQuotation = ({ quotationData, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const [actionsMenuAnchorEl, setActionsMenuAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isExpired = quotationData.expiryDate && dayjs(quotationData.expiryDate).isBefore(dayjs(), 'day');

  // Map the data structure to expected format if needed
  const normalizedData = {
    _id: quotationData._id,
    quotationNumber: quotationData.quotation_id || '',
    subject: quotationData.reference_no !== 'undefined' ? quotationData.reference_no : '',
    status: quotationData.status || 'DRAFTED',
    customerName: quotationData.customerId?.name || '',
    customerEmail: quotationData.customerId?.email || '',
    customerAddress: quotationData.customerId?.billingAddress ? 
      `${quotationData.customerId.billingAddress.addressLine1 || ''} ${quotationData.customerId.billingAddress.addressLine2 || ''}, 
      ${quotationData.customerId.billingAddress.city || ''}, ${quotationData.customerId.billingAddress.state || ''}, 
      ${quotationData.customerId.billingAddress.country || ''} - ${quotationData.customerId.billingAddress.pincode || ''}` : '',
    date: quotationData.quotation_date,
    expiryDate: quotationData.due_date,
    items: quotationData.items || [],
    subTotal: quotationData.taxableAmount || '0.00',
    totalDiscount: quotationData.totalDiscount || '0.00',
    totalTax: quotationData.vat || '0.00',
    totalAmount: quotationData.TotalAmount || '0.00',
    notes: quotationData.notes || '',
    termsAndConditions: quotationData.termsAndCondition || '',
    signature: quotationData.signatureId?.signatureImage || quotationData.signatureImage || null
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

  const handleActionsMenuOpen = (event) => {
    setActionsMenuAnchorEl(event.currentTarget);
  };

  const handleActionsMenuClose = () => {
    setActionsMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleActionsMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      const response = await deleteQuotation(quotationData._id);
      
      if (response.success) {
        enqueueSnackbar('Quotation deleted successfully!', { variant: 'success' });
        router.push('/quotations/quotation-list?success=delete');
      } else {
        throw new Error(response.message || 'Failed to delete quotation');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      enqueueSnackbar('Failed to delete quotation: ' + error.message, { variant: 'error' });
    } finally {
      setIsLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleConvertClick = () => {
    setOpenConvertDialog(true);
    handleActionsMenuClose();
  };

  const handleConvertConfirm = async () => {
    try {
      setIsLoading(true);
      const response = await convertToInvoice(quotationData._id);
      
      if (response.success) {
        enqueueSnackbar('Quotation converted to invoice successfully!', { variant: 'success' });
        router.push('/quotations/quotation-list?success=convert');
      } else {
        throw new Error(response.message || 'Failed to convert quotation to invoice');
      }
    } catch (error) {
      console.error('Error converting quotation:', error);
      enqueueSnackbar('Failed to convert quotation: ' + error.message, { variant: 'error' });
    } finally {
      setIsLoading(false);
      setOpenConvertDialog(false);
    }
  };

  return (
    <>
      {/* Header Section - Slightly enhanced with better spacing and visual hierarchy */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6, // Increased bottom margin for better spacing
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 3, sm: 0 } // Increased gap on mobile
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}> {/* Increased gap */}
          <Avatar
            sx={{
              width: 52, // Slightly larger
              height: 52, // Slightly larger
              backgroundColor: alpha(theme.palette.primary.main, 0.15), // Slightly more vibrant
              color: 'primary.main',
              boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` // Added subtle shadow
            }}
          >
            <Icon icon="tabler:file-analytics" fontSize={28} /> {/* Slightly larger icon */}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}> {/* Increased font weight */}
              Quotation #{normalizedData.quotationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}> {/* Added margin top */}
              {normalizedData.subject || 'No Subject'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2.5 }}> {/* Increased gap */}
          {/* Status Chip with dropdown - Enhanced with better visual feedback */}
          <Box sx={{ position: 'relative' }}>
            <Chip
              label={normalizedData.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              color={getStatusColor(normalizedData.status)}
              size="medium"
              variant="tonal"
              onClick={handleStatusMenuOpen}
              sx={{ 
                fontWeight: 600, // Increased font weight
                cursor: 'pointer', 
                borderRadius: '10px',
                py: 2.2, // Slightly taller
                px: 1.5, // Slightly wider
                transition: 'all 0.2s ease', // Added transition
                '&:hover': {
                  boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` // Hover effect
                }
              }}
              icon={
                <Icon 
                  icon="tabler:chevron-down" 
                  style={{ 
                    fontSize: 18,
                    marginLeft: '8px'
                  }} 
                />
              }
            />
          </Box>

          {/* Actions Button - Enhanced with better visual feedback */}
          <Button
            variant="contained"
            onClick={handleActionsMenuOpen}
            endIcon={<Icon icon="tabler:chevron-down" />}
            sx={{
              borderRadius: '10px',
              py: 1.2, // Slightly taller
              px: 3.5, // Slightly wider
              boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`, // Enhanced shadow
              transition: 'all 0.2s ease', // Added transition
              '&:hover': {
                transform: 'translateY(-2px)', // Subtle lift effect on hover
                boxShadow: theme => `0 6px 15px ${alpha(theme.palette.primary.main, 0.3)}` // Enhanced hover shadow
              }
            }}
          >
            Actions
          </Button>
        </Box>
      </Box>

      {/* Main Card - Enhanced with subtle improvements */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px', // Slightly more rounded
          border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme => `0 6px 16px ${alpha(theme.palette.common.black, 0.05)}`, // Enhanced shadow
          mb: 5,
          transition: 'all 0.3s ease', // Added transition
          '&:hover': {
            boxShadow: theme => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}` // Enhanced hover shadow
          }
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header Information */}
          <Grid container spacing={5} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  mb: 4
                }}
              >
                <Avatar
                  sx={{
                    width: 68, // Slightly larger
                    height: 68, // Slightly larger
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontSize: '1.6rem', // Slightly larger
                    fontWeight: 600, // Increased font weight
                    boxShadow: theme => `0 3px 10px ${alpha(theme.palette.primary.main, 0.15)}` // Added subtle shadow
                  }}
                >
                  {normalizedData.customerName && normalizedData.customerName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {normalizedData.customerName}
                  </Typography>
                  {normalizedData.customerEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {normalizedData.customerEmail}
                    </Typography>
                  )}
                </Box>
              </Box>

              {normalizedData.customerAddress && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Customer Address
                  </Typography>
                  <Typography variant="body2">
                    {normalizedData.customerAddress}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Quotation Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      #{normalizedData.quotationNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(normalizedData.date)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Expiry Date
                    </Typography>
                    <Chip 
                      label={formatDate(normalizedData.expiryDate)} 
                      size="small"
                      variant="tonal"
                      color={isExpired ? 'error' : 'info'}
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatNumber(normalizedData.totalAmount)} SAR
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Items Table - Enhanced with subtle hover effects */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}> {/* Increased font weight */}
            Quotation Items
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '14px', // Slightly more rounded
              border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 5,
              overflow: 'hidden', // Ensures the border-radius is applied to the table
              transition: 'all 0.2s ease', // Added transition
              '&:hover': {
                boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.06)}` // Hover effect
              }
            }}
          >
            <Table sx={{ minWidth: 650 }} size={isSmallScreen ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.default, 0.7) }}> {/* Slightly darker */}
                  <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Item</TableCell> {/* Increased font weight and padding */}
                  <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Units</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 2.2 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 2.2 }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 2.2 }}>Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 2.2 }}>VAT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 2.2 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {normalizedData.items && normalizedData.items.length > 0 ? (
                  normalizedData.items.map((item, index) => (
                    <TableRow 
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <TableCell component="th" scope="row">{item.name}</TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatNumber(item.rate)}</TableCell>
                      <TableCell align="right">
                        {quotationData.discountType === '2'
                          ? `${item.discount}% (${formatNumber((item.discount / 100) * item.rate * item.quantity)} SAR)`
                          : `${formatNumber(item.discount)} SAR`}
                      </TableCell>
                      <TableCell align="right">{item.tax}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {formatNumber(item.amount)} SAR
                      </TableCell>
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

          {/* Total Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Box
              sx={{
                width: { xs: '100%', sm: '60%', md: '40%' },
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                ml: 'auto',
                background: theme => `
                  linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
                  linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)}) border-box
                `,
                border: '1px solid transparent',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundImage: theme => `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  opacity: 0.2,
                  borderTopLeftRadius: '12px',
                  borderBottomLeftRadius: '12px'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Grid container sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatNumber(normalizedData.subTotal)} SAR
                    </Typography>
                  </Grid>
                </Grid>

                {parseFloat(normalizedData.totalDiscount) > 0 && (
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Discount
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ({formatNumber(normalizedData.totalDiscount)}) SAR
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {parseFloat(normalizedData.totalTax) > 0 && (
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        VAT
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatNumber(normalizedData.totalTax)} SAR
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                <Divider sx={{ my: 2 }} />

                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {formatNumber(normalizedData.totalAmount)} SAR
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Notes Section */}
          {normalizedData.notes && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Notes
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Typography variant="body2">
                  {normalizedData.notes}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Terms and Conditions */}
          {normalizedData.termsAndConditions && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Terms and Conditions
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Typography variant="body2">
                  {normalizedData.termsAndConditions}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Signature Section */}
          {normalizedData.signature && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Signature
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Box
                  component="img"
                  src={normalizedData.signature}
                  alt="Signature"
                  sx={{
                    maxWidth: 250,
                    maxHeight: 100,
                    display: 'block'
                  }}
                />
              </Paper>
            </Box>
          )}

          {/* Action Buttons - Enhanced with better visual feedback */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}> {/* Increased top margin */}
            <Button
              variant="outlined"
              component={Link}
              href="/quotations/quotation-list"
              startIcon={<Icon icon="tabler:arrow-left" />}
              sx={{
                borderRadius: '10px',
                py: 1.3, // Slightly taller
                px: 4,
                borderWidth: '2px',
                transition: 'all 0.2s ease', // Added transition
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateX(-3px)' // Subtle movement on hover
                }
              }}
            >
              Back to List
            </Button>
            <Box sx={{ display: 'flex', gap: 2.5 }}> {/* Increased gap */}
              <Button
                variant="outlined"
                component={Link}
                href={`/quotations/quotation-edit/${normalizedData._id}`}
                startIcon={<Icon icon="tabler:edit" />}
                sx={{
                  borderRadius: '10px',
                  py: 1.3, // Slightly taller
                  px: 4,
                  borderWidth: '2px',
                  transition: 'all 0.2s ease', // Added transition
                  '&:hover': {
                    borderWidth: '2px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.04) // Subtle background on hover
                  }
                }}
              >
                Edit
              </Button>
              {normalizedData.status !== 'CONVERTED' && (
                <Button
                  variant="contained"
                  onClick={handleConvertClick}
                  startIcon={<Icon icon="tabler:arrow-right" />}
                  sx={{
                    borderRadius: '10px',
                    py: 1.3, // Slightly taller
                    px: 4,
                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`, // Enhanced shadow
                    transition: 'all 0.2s ease', // Added transition
                    '&:hover': {
                      transform: 'translateX(3px)', // Subtle movement on hover
                      boxShadow: theme => `0 6px 15px ${alpha(theme.palette.primary.main, 0.3)}` // Enhanced hover shadow
                    }
                  }}
                >
                  Convert to Invoice
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Status Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 180,
              borderRadius: '12px',
              boxShadow: theme => `0 4px 14px 0 ${alpha(theme.palette.common.black, 0.1)}`,
              mt: 1
            }
          }
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={normalizedData.status === 'CONVERTED' || isLoading}
            sx={{ 
              py: 1.5, 
              pl: 2.5, 
              pr: 3, 
              borderRadius: '8px', 
              mx: 1, 
              my: 0.5,
              color: normalizedData.status === 'CONVERTED' ? 'text.disabled' : 'text.primary'
            }}
          >
            <Chip 
              label={option.label}
              size="small"
              color={getStatusColor(option.value)}
              variant="tonal"
              sx={{ fontWeight: 500, minWidth: 80 }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionsMenuAnchorEl}
        open={Boolean(actionsMenuAnchorEl)}
        onClose={handleActionsMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 220,
              borderRadius: '12px',
              boxShadow: theme => `0 4px 14px 0 ${alpha(theme.palette.common.black, 0.1)}`,
              mt: 1
            }
          }
        }}
      >
        <MenuItem
          component={Link}
          href={`/quotations/quotation-edit/${normalizedData._id}`}
          onClick={handleActionsMenuClose}
          sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
        >
          <Icon icon="tabler:edit" fontSize={20} style={{ marginRight: '12px' }} />
          Edit
        </MenuItem>
        {normalizedData.status !== 'CONVERTED' && (
          <MenuItem
            onClick={handleConvertClick}
            sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
          >
            <Icon icon="tabler:arrow-right" fontSize={20} style={{ marginRight: '12px' }} />
            Convert to Invoice
          </MenuItem>
        )}
        <Divider sx={{ my: 1.5 }} />
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ 
            py: 1.5, 
            pl: 2.5, 
            pr: 3, 
            borderRadius: '8px', 
            mx: 1, 
            my: 0.5, 
            color: 'error.main',
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) }
          }}
        >
          <Icon icon="tabler:trash" fontSize={20} style={{ marginRight: '12px' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: { xs: '90%', sm: 'auto' },
            minWidth: { sm: 400 },
            boxShadow: theme => `0 8px 24px 0 ${alpha(theme.palette.common.black, 0.16)}`
          }
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 4, fontSize: '1.25rem' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <DialogContentText>
            Are you sure you want to delete this quotation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            disabled={isLoading}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isLoading}
            startIcon={isLoading ? null : <Icon icon="tabler:trash" />}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              ml: 2
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert to Invoice Confirmation Dialog */}
      <Dialog
        open={openConvertDialog}
        onClose={() => setOpenConvertDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: { xs: '90%', sm: 'auto' },
            minWidth: { sm: 400 },
            boxShadow: theme => `0 8px 24px 0 ${alpha(theme.palette.common.black, 0.16)}`
          }
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 4, fontSize: '1.25rem' }}>
          Convert to Invoice
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <DialogContentText>
            Are you sure you want to convert this quotation to an invoice? This will create a new invoice with the same details.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={() => setOpenConvertDialog(false)}
            variant="outlined"
            disabled={isLoading}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvertConfirm}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? null : <Icon icon="tabler:arrow-right" />}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              ml: 2
            }}
          >
            {isLoading ? 'Converting...' : 'Convert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewQuotation;
