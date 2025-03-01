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
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 5,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main'
            }}
          >
            <Icon icon="tabler:file-analytics" fontSize={26} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Quotation #{quotationData.quotationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quotationData.subject || 'No Subject'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Status Chip with dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Chip
              label={quotationData.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              color={getStatusColor(quotationData.status)}
              size="medium"
              variant="tonal"
              onClick={handleStatusMenuOpen}
              sx={{ 
                fontWeight: 500, 
                cursor: 'pointer', 
                borderRadius: '10px',
                py: 2,
                px: 1
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

          {/* Actions Button */}
          <Button
            variant="contained"
            onClick={handleActionsMenuOpen}
            endIcon={<Icon icon="tabler:chevron-down" />}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Actions
          </Button>
        </Box>
      </Box>

      {/* Main Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          mb: 5
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
                    width: 64,
                    height: 64,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 500
                  }}
                >
                  {quotationData.customerName && quotationData.customerName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {quotationData.customerName}
                  </Typography>
                  {quotationData.customerEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {quotationData.customerEmail}
                    </Typography>
                  )}
                </Box>
              </Box>

              {quotationData.customerAddress && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Customer Address
                  </Typography>
                  <Typography variant="body2">
                    {quotationData.customerAddress}
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
                      #{quotationData.quotationNumber}
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
                      {formatDate(quotationData.date)}
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
                      label={formatDate(quotationData.expiryDate)} 
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
                      {formatNumber(quotationData.totalAmount)} SAR
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Items Table */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
            Quotation Items
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 5
            }}
          >
            <Table sx={{ minWidth: 650 }} size={isSmallScreen ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.default, 0.6) }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Units</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>VAT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Amount</TableCell>
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
                      <TableCell component="th" scope="row">{item.name}</TableCell>
                      <TableCell>{item.units || '-'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatNumber(item.rate)}</TableCell>
                      <TableCell align="right">
                        {item.discountType === '2'
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
                      {formatNumber(quotationData.subTotal)} SAR
                    </Typography>
                  </Grid>
                </Grid>

                {quotationData.totalDiscount > 0 && (
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Discount
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ({formatNumber(quotationData.totalDiscount)}) SAR
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {quotationData.totalTax > 0 && (
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        VAT
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatNumber(quotationData.totalTax)} SAR
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
                      {formatNumber(quotationData.totalAmount)} SAR
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Notes Section */}
          {quotationData.notes && (
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
                  {quotationData.notes}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Terms and Conditions */}
          {quotationData.termsAndConditions && (
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
                  {quotationData.termsAndConditions}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Signature Section */}
          {quotationData.signature && (
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
                  src={quotationData.signature}
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              component={Link}
              href="/quotations/quotation-list"
              startIcon={<Icon icon="tabler:arrow-left" />}
              sx={{
                borderRadius: '10px',
                py: 1.2,
                px: 4,
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px'
                }
              }}
            >
              Back to List
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                href={`/quotations/quotation-edit/${quotationData._id}`}
                startIcon={<Icon icon="tabler:edit" />}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 4,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                Edit
              </Button>
              {quotationData.status !== 'CONVERTED' && (
                <Button
                  variant="contained"
                  onClick={handleConvertClick}
                  startIcon={<Icon icon="tabler:arrow-right" />}
                  sx={{
                    borderRadius: '10px',
                    py: 1.2,
                    px: 4,
                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
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
            disabled={quotationData.status === 'CONVERTED' || isLoading}
            sx={{ 
              py: 1.5, 
              pl: 2.5, 
              pr: 3, 
              borderRadius: '8px', 
              mx: 1, 
              my: 0.5,
              color: quotationData.status === 'CONVERTED' ? 'text.disabled' : 'text.primary'
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
          href={`/quotations/quotation-edit/${quotationData._id}`}
          onClick={handleActionsMenuClose}
          sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
        >
          <Icon icon="tabler:edit" fontSize={20} style={{ marginRight: '12px' }} />
          Edit
        </MenuItem>
        {quotationData.status !== 'CONVERTED' && (
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
