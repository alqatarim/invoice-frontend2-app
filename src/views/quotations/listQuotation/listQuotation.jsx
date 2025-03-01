'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
    Divider ,
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
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  useMediaQuery
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/helpers';
import dayjs from 'dayjs';
import QuotationFilter from './QuotationFilter';
import { deleteQuotation, convertToInvoice, updateQuotationStatus } from '@/app/(dashboard)/quotations/actions';

// ** Status options definition for dropdown
const statusOptions = [
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Drafted', value: 'DRAFTED' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Rejected', value: 'REJECTED' }
];

// Helper function to get status color
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

// Format number helper function
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Helper function to map API status to display status
const mapStatusToDisplay = (apiStatus) => {
  const statusMap = {
    'Open': 'SENT',
    'Accepted': 'ACCEPTED',
    'Rejected': 'REJECTED',
    'Expired': 'EXPIRED',
    'Draft': 'DRAFTED',
    'Converted': 'CONVERTED'
  };
  
  return statusMap[apiStatus] || 'SENT'; // Default to SENT if unknown
};

const ListQuotation = ({ initialData, customers, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [quotations, setQuotations] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: Math.ceil((initialData?.totalRecords || 0) / 10)
  });
  
  const [filters, setFilters] = useState({
    customer: [],
    status: [],
    fromDate: '',
    toDate: ''
  });
  
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const [selectedIdForStatus, setSelectedIdForStatus] = useState(null);

  // Show success message if redirected from add/edit page
  useEffect(() => {
    if (successParam === 'add') {
      enqueueSnackbar('Quotation added successfully!', { variant: 'success' });
    } else if (successParam === 'edit') {
      enqueueSnackbar('Quotation updated successfully!', { variant: 'success' });
    } else if (successParam === 'delete') {
      enqueueSnackbar('Quotation deleted successfully!', { variant: 'success' });
    } else if (successParam === 'convert') {
      enqueueSnackbar('Quotation converted to invoice successfully!', { variant: 'success' });
    }

    // Clear the success parameter from the URL
    if (successParam) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [successParam, enqueueSnackbar]);

  const fetchQuotations = async (page = pagination.page, newFilters = filters) => {
    try {
      setLoadingAction(true);
      const response = await fetch(`/api/quotations?page=${page}&limit=${pagination.pageSize}${
        newFilters.customer && newFilters.customer.length > 0 ? `&customer=${newFilters.customer.join(',')}` : ''
      }${
        newFilters.status && newFilters.status.length > 0 ? `&status=${newFilters.status.join(',')}` : ''
      }${
        newFilters.fromDate ? `&fromDate=${newFilters.fromDate}` : ''
      }${
        newFilters.toDate ? `&toDate=${newFilters.toDate}` : ''
      }`);
      
      const data = await response.json();
      
      if (data.success) {
        setQuotations(data.data);
        setPagination({
          ...pagination,
          page,
          totalPages: Math.ceil(data.totalRecords / pagination.pageSize)
        });
      } else {
        throw new Error(data.message || 'Failed to fetch quotations');
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      enqueueSnackbar('Failed to fetch quotations: ' + error.message, { variant: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
    fetchQuotations(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
    fetchQuotations(1, newFilters);
  };

  const handleActionClick = (event, quotation) => {
    setSelectedQuotation(quotation);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleActionClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoadingAction(true);
      const response = await deleteQuotation(selectedQuotation._id);
      
      if (response.success) {
        setOpenDeleteDialog(false);
        enqueueSnackbar('Quotation deleted successfully!', { variant: 'success' });
        fetchQuotations();
      } else {
        throw new Error(response.message || 'Failed to delete quotation');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      enqueueSnackbar('Failed to delete quotation: ' + error.message, { variant: 'error' });
    } finally {
      setLoadingAction(false);
      setSelectedQuotation(null);
    }
  };

  const handleConvertClick = () => {
    setOpenConvertDialog(true);
    handleActionClose();
  };

  const handleConvertConfirm = async () => {
    try {
      setLoadingAction(true);
      const response = await convertToInvoice(selectedQuotation._id);
      
      if (response.success) {
        setOpenConvertDialog(false);
        enqueueSnackbar('Quotation converted to invoice successfully!', { variant: 'success' });
        fetchQuotations();
      } else {
        throw new Error(response.message || 'Failed to convert quotation to invoice');
      }
    } catch (error) {
      console.error('Error converting quotation:', error);
      enqueueSnackbar('Failed to convert quotation: ' + error.message, { variant: 'error' });
    } finally {
      setLoadingAction(false);
      setSelectedQuotation(null);
    }
  };

  const handleStatusMenuOpen = (event, id) => {
    setStatusMenuAnchorEl(event.currentTarget);
    setSelectedIdForStatus(id);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
    setSelectedIdForStatus(null);
  };

  const handleStatusChange = async (status) => {
    try {
      setLoadingAction(true);
      const response = await updateQuotationStatus(selectedIdForStatus, status);
      
      if (response.success) {
        enqueueSnackbar('Quotation status updated successfully!', { variant: 'success' });
        fetchQuotations();
      } else {
        throw new Error(response.message || 'Failed to update quotation status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Failed to update status: ' + error.message, { variant: 'error' });
    } finally {
      setLoadingAction(false);
      handleStatusMenuClose();
    }
  };

  const isExpired = (expiryDate) => {
    return dayjs(expiryDate).isBefore(dayjs(), 'day');
  };

  return (
    <>
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
              Quotations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your customer quotations
            </Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          href="/quotations/quotation-add"
          variant="contained"
          startIcon={<Icon icon="tabler:plus" />}
          sx={{
            borderRadius: '10px',
            py: 1.2,
            px: 4,
            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          New Quotation
        </Button>
      </Box>

      <QuotationFilter onFilterChange={handleFilterChange} customers={customers} />
      
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          mb: 5
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: '60vh',
              overflow: 'auto',
              borderRadius: '16px',
              border: 'none',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.background.default, 0.5)
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: '4px'
              }
            }}
          >
            <Table sx={{ minWidth: 750 }} size={isSmallScreen ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.default, 0.6) }}>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      py: 2, 
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Quotation Number
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      py: 2, 
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Subject
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Expiry Date
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 600, 
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      backgroundColor: alpha(theme.palette.background.default, 0.9),
                      backdropFilter: 'blur(8px)',
                      zIndex: 1
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations && quotations.length > 0 ? (
                  quotations.map((quotation) => (
                    <TableRow
                      key={quotation._id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          cursor: 'pointer'
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              fontSize: '0.875rem'
                            }}
                          >
                            <Icon icon="tabler:file-invoice" fontSize={18} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {quotation.quotation_id || quotation.quotationNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}>
                        <Typography variant="body2">
                          {quotation.customerId?.name || quotation.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {quotation.reference_no || quotation.subject || 'No Subject'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(quotation.TotalAmount || quotation.totalAmount)} SAR
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}>
                        <Chip 
                          label={formatDate(quotation.quotation_date || quotation.date)} 
                          size="small"
                          variant="tonal"
                          color="secondary"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center" onClick={() => router.push(`/quotations/quotation-view/${quotation._id}`)}>
                        <Chip 
                          label={formatDate(quotation.due_date || quotation.expiryDate)} 
                          size="small"
                          variant="tonal"
                          color={isExpired(quotation.due_date || quotation.expiryDate) ? 'error' : 'info'}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={quotation.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          size="small"
                          color={getStatusColor(mapStatusToDisplay(quotation.status))}
                          variant="tonal"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusMenuOpen(e, quotation._id);
                          }}
                          sx={{ fontWeight: 500, cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(e, quotation);
                          }}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            }
                          }}
                        >
                          <Icon icon="tabler:dots-vertical" fontSize={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main'
                          }}
                        >
                          <Icon icon="tabler:file-off" fontSize={30} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          No Quotations Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {filters.customer.length > 0 || filters.status.length > 0 || filters.fromDate || filters.toDate
                            ? 'Try clearing your filters or create a new quotation'
                            : 'Create your first quotation to get started'
                          }
                        </Typography>
                        <Button
                          component={Link}
                          href="/quotations/quotation-add"
                          variant="contained"
                          startIcon={<Icon icon="tabler:plus" />}
                          sx={{
                            mt: 2,
                            borderRadius: '10px',
                            py: 1,
                            px: 3,
                            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                          }}
                        >
                          New Quotation
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {quotations && quotations.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                siblingCount={isSmallScreen ? 0 : 1}
                showFirstButton={!isSmallScreen}
                showLastButton={!isSmallScreen}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
          href={`/quotations/quotation-view/${selectedQuotation?._id}`}
          onClick={handleActionClose}
          sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
        >
          <Icon icon="tabler:eye" fontSize={20} style={{ marginRight: '12px' }} />
          View Details
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/quotations/quotation-edit/${selectedQuotation?._id}`}
          onClick={handleActionClose}
          sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
        >
          <Icon icon="tabler:edit" fontSize={20} style={{ marginRight: '12px' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleConvertClick}
          disabled={selectedQuotation?.status === 'CONVERTED'}
          sx={{ 
            py: 1.5, 
            pl: 2.5, 
            pr: 3, 
            borderRadius: '8px', 
            mx: 1, 
            my: 0.5,
            color: selectedQuotation?.status === 'CONVERTED' ? 'text.disabled' : 'text.primary'
          }}
        >
          <Icon icon="tabler:arrow-right" fontSize={20} style={{ marginRight: '12px' }} />
          Convert to Invoice
        </MenuItem>
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

      {/* Status Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
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
            sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
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
            disabled={loadingAction}
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
            disabled={loadingAction}
            startIcon={loadingAction ? null : <Icon icon="tabler:trash" />}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              ml: 2
            }}
          >
            {loadingAction ? 'Deleting...' : 'Delete'}
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
            disabled={loadingAction}
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
            disabled={loadingAction}
            startIcon={loadingAction ? null : <Icon icon="tabler:arrow-right" />}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 3,
              ml: 2
            }}
          >
            {loadingAction ? 'Converting...' : 'Convert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListQuotation;
