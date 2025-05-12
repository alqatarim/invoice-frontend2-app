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
import { formatDate, formatNumber } from '@/utils/helpers';
import dayjs from 'dayjs';
import {updateQuotationStatus } from '@/app/(dashboard)/quotations/actions';



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

            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}> {/* Increased font weight */}
              Quotation
            </Typography>


        </Box>

      </Box>

      {/* Main Card - Enhanced with subtle improvements */}
      <Card

      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header Information */}
          <Grid container spacing={5} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Box
              className='flex items-center gap-3 mb-4'
                            >
                <Avatar
                  sx={{
                    width: 68,
                    height: 68,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    boxShadow: theme => `0 2px 5px ${alpha(theme.palette.primary.main, 0.35)}`
                  }}
                >
                  {quotationData.customerId?.name && quotationData.customerId.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {quotationData.customerId?.name || ''}
                  </Typography>
                  {quotationData.customerId?.email && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                      {quotationData.customerId.phone}
                    </Typography>
                  )}
                </Box>
              </Box>


                <Box className='flex flex-col gap-1 mb-4'>

                 {quotationData.customerId?.billingAddress && (
                 <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
                    {`${quotationData.customerId.billingAddress.addressLine1 || ''} ${quotationData.customerId.billingAddress.addressLine2 || ''},
                    ${quotationData.customerId.billingAddress.city || ''}, ${quotationData.customerId.billingAddress.state || ''},
                    ${quotationData.customerId.billingAddress.country || ''} - ${quotationData.customerId.billingAddress.pincode || ''}`}
                  </Typography>
                 )}
                  {quotationData.customerId?.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
                      {quotationData.customerId.email}
                    </Typography>
                  )}
                </Box>

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
                    <Typography variant="caption" className='text-[14px]' color="text.secondary" gutterBottom>
                      Quotation Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      #{quotationData.quotation_id || ''}
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
                    <Typography variant="caption" className='text-[14px]' color="text.secondary" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatNumber(quotationData.TotalAmount)}
                    </Typography>
                  </Box>
                </Grid>




                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="caption" className='text-[14px]' color="text.secondary" gutterBottom>
                       Creation Date
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Chip
                        label={formatDate(quotationData.quotation_date)}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '8px', width: 'fit-content', fontSize: '14px' }}
                      />
                    </Box>
                  </Box>
                </Grid>


                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="caption" className='text-[14px]' color="text.secondary" gutterBottom>
                      Expiry Date
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Chip
                        label={formatDate(quotationData.due_date)}
                        size="small"
                        variant="outlined"
                        color={isExpired ? 'error' : 'default'}
                        sx={{ borderRadius: '8px', width: 'fit-content', fontSize: '14px' }}
                      />
                    </Box>
                  </Box>
                </Grid>

              </Grid>
            </Grid>
          </Grid>

          {/* Items Table - Enhanced with subtle hover effects */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}> {/* Increased font weight */}
            Items
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}

            sx={{
              borderRadius: '14px', // Slightly more rounded
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              mb: 5,
              overflow: 'hidden', // Ensures the border-radius is applied to the table
              transition: 'all 0.2s ease', // Added transition
              boxShadow: theme => `0 3px 6px ${alpha(theme.palette.common.black, 0.06)}`, // Hover effect

            }}
          >
            <Table sx={{ minWidth: 650 }} size={isSmallScreen ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.default, 0.7) }}> {/* Slightly darker */}
                  <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Item</TableCell> {/* Increased font weight and padding */}
                  <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Units</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>VAT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotationData.items && quotationData.items.length > 0 ? (
                  quotationData.items.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{  fontSize: '14px' }}>
                        {getProductName(item.productId)}
                      </TableCell>
                      <TableCell sx={{  fontSize: '14px' }}>{getUnitName(item.unit)}</TableCell>
                      <TableCell align="right" sx={{  fontSize: '14px' }}>{item.quantity}</TableCell>
                      <TableCell align="right" sx={{  fontSize: '14px' }}>{formatNumber(item.rate)}</TableCell>
                      <TableCell align="right" sx={{  fontSize: '14px' }}>
                        {quotationData.discountType === '2'
                          ? `${item.discount}% (${formatNumber((item.discount / 100) * item.rate * item.quantity)})`
                          : `${formatNumber(item.discount)}`}
                      </TableCell>
                      <TableCell align="right" sx={{  fontSize: '14px' }}>{item.tax}%</TableCell>
                      <TableCell align="right" sx={{  fontSize: '14px' }}>
                        {formatNumber(item.amount)}
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
              <Box className='flex flex-col gap-2 p-4'>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: '14px' }}>
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {formatNumber(quotationData.taxableAmount)}
                    </Typography>
                  </Grid>
                </Grid>

                {parseFloat(quotationData.totalDiscount || '0.00') > 0 && (
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: '14px' }}>
                        Discount
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {`(${formatNumber(quotationData.totalDiscount)})`}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {parseFloat(quotationData.vat || '0.00') > 0 && (
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: '14px' }}>
                        VAT
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {formatNumber(quotationData.vat)}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                <Divider  />

                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px' }}>
                      Total
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px' }}>
                      {formatNumber(quotationData.TotalAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>


          {/* Notes & TermsSection */}

          {/* Notes */}
          {quotationData.notes && (



            <Grid container className='mb-4 flex-flex-col' >
              <Grid item xs={12} md={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Notes
              </Typography>

                 </Grid>

                <Grid item xs={12} md={9} lg={7}
                  sx={{
                  p: 3,
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.default, 0.6),

                }}
                >
                <Typography variant="body2"
                //       sx={{
                //   p: 3,
                //   borderRadius: '12px',
                //   backgroundColor: alpha(theme.palette.background.default, 0.6),

                // }}

                >
                  {quotationData.notes}
                </Typography>

                </Grid>

              </Grid>


          )}

          {/* Terms and Conditions */}
          {quotationData.termsAndCondition && (
            <Grid container className='mb-4 flex-flex-col' >
              <Grid item xs={12} md={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Terms and Conditions
              </Typography>

              </Grid>

              <Grid item xs={12} md={9} lg={7}>
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
                  {quotationData.termsAndCondition}
                </Typography>
              </Paper>
              </Grid>
              </Grid>
          )}

          {/* Signature Section */}
          {(quotationData.signatureId?.signatureImage) && (
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
                  src={quotationData.signatureId?.signatureImage || quotationData.signatureImage}
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
          <Box className='flex justify-between mt-5'> {/* Increased top margin */}
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


    </>
  );
};

export default ViewQuotation;


