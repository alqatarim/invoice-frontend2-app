'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Divider,
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
     MenuItem,
     Pagination,
     Stack,

     Typography,
     Paper,
     useMediaQuery,
     Grid,

     FormControl,
     InputLabel,
     Select
} from '@mui/material';
import { Icon } from '@iconify/react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { formatDate } from '@/utils/dateUtils';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/currencyUtils';
import { deleteQuotation, convertToInvoice, updateQuotationStatus, getQuotationsList } from '@/app/(dashboard)/quotations/actions';
import CustomListTable from '@/components/custom-components/CustomListTable';
import OptionMenu from '@core/components/option-menu';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { quotationStatusOptions } from '@/data/dataSets';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

// Helper function to get status color
const getStatusColor = (status) => {
     const statusOption = quotationStatusOptions.find(opt => opt.value === status);
     return statusOption?.color || 'default';
};

// Format number helper function
const formatNumber = (value) => {
     if (value === null || value === undefined) return '0.00';
     const num = typeof value === 'string' ? parseFloat(value) : value;
     return isNaN(num) ? '0.00' : Number(num).toFixed(2);
};

// Payment method options
const paymentMethodOptions = [
     { value: 'Cash', label: 'Cash' },
     { value: 'Credit Card', label: 'Credit Card' },
     { value: 'Debit Card', label: 'Debit Card' },
     { value: 'Bank Transfer', label: 'Bank Transfer' },
     { value: 'Check', label: 'Check' },
     { value: 'Online', label: 'Online Payment' }
];

const ListQuotation = ({ initialData, customers }) => {
     const theme = useTheme();
     const router = useRouter();
     const searchParams = useSearchParams();
     const { data: session } = useSession();
     const successParam = searchParams.get('success');
     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

     // Helper function to check if quotation is expired (defined early)
     const isExpired = (expiryDate) => {
          return dayjs(expiryDate).isBefore(dayjs(), 'day');
     };

     // Permissions
     const permissions = {
          canCreate: usePermission('quotation', 'create'),
          canUpdate: usePermission('quotation', 'update'),
          canView: usePermission('quotation', 'view'),
          canDelete: usePermission('quotation', 'delete'),
     };

     const [quotations, setQuotations] = useState(initialData?.data || []);
     const [searchTerm, setSearchTerm] = useState('');
     const [filteredQuotations, setFilteredQuotations] = useState(initialData?.data || []);
     const [loading, setLoading] = useState(false);

     const [pagination, setPagination] = useState({
          current: 1,
          pageSize: 10,
          total: initialData?.totalRecords || initialData?.data?.length || 0
     });

     const [selectedQuotation, setSelectedQuotation] = useState(null);
     const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
     const [openConvertDialog, setOpenConvertDialog] = useState(false);
     const [loadingAction, setLoadingAction] = useState(false);
     const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success',
     });

     // Notification handlers
     const onError = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'error' });
     }, []);

     const onSuccess = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'success' });
     }, []);

     // Calculate card counts with new categories: Total, Open, Converted, Expired
     const cardCounts = {
          totalQuotations: {
               count: quotations.length,
               total_sum: quotations.reduce((sum, q) => sum + (Number(q.TotalAmount) || 0), 0)
          },
          totalOpen: {
               count: quotations.filter(q => ['Open', 'SENT', 'ACCEPTED', 'DRAFTED'].includes(q.status) && !isExpired(q.due_date)).length,
               total_sum: quotations.filter(q => ['Open', 'SENT', 'ACCEPTED', 'DRAFTED'].includes(q.status) && !isExpired(q.due_date)).reduce((sum, q) => sum + (Number(q.TotalAmount) || 0), 0)
          },
          totalConverted: {
               count: quotations.filter(q => q.status === 'CONVERTED').length,
               total_sum: quotations.filter(q => q.status === 'CONVERTED').reduce((sum, q) => sum + (Number(q.TotalAmount) || 0), 0)
          },
          totalExpired: {
               count: quotations.filter(q => q.status === 'EXPIRED' || isExpired(q.due_date)).length,
               total_sum: quotations.filter(q => q.status === 'EXPIRED' || isExpired(q.due_date)).reduce((sum, q) => sum + (Number(q.TotalAmount) || 0), 0)
          }
     };

     const fetchQuotations = useCallback(async ({ page = pagination.current, pageSize = pagination.pageSize } = {}) => {
          setLoading(true);
          try {
               const response = await getQuotationsList(page, pageSize, {});
               if (response?.success) {
                    const nextData = response.data || [];
                    setQuotations(nextData);
                    setFilteredQuotations(nextData);
                    setPagination({
                         current: page,
                         pageSize,
                         total: response.totalRecords || nextData.length
                    });
               } else {
                    onError(response?.message || 'Failed to load quotations');
               }
          } catch (error) {
               onError(error.message || 'Failed to load quotations');
          } finally {
               setLoading(false);
          }
     }, [onError, pagination.current, pagination.pageSize]);

     useEffect(() => {
          if ((initialData?.data || []).length > 0) return;
          fetchQuotations();
     }, [fetchQuotations, initialData?.data]);

     // Search functionality
     useEffect(() => {
          if (!searchTerm) {
               setFilteredQuotations(quotations);
          } else {
               const filtered = quotations.filter(quotation =>
                    quotation.quotation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quotation.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quotation.customerId?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
               );
               setFilteredQuotations(filtered);
          }
     }, [searchTerm, quotations]);

     // Show success message if redirected from add/edit page
     useEffect(() => {
          if (successParam === 'add') {
               onSuccess('Quotation added successfully!');
          } else if (successParam === 'edit') {
               onSuccess('Quotation updated successfully!');
          } else if (successParam === 'delete') {
               onSuccess('Quotation deleted successfully!');
          } else if (successParam === 'convert') {
               onSuccess('Quotation converted to invoice successfully!');
          }

          // Clear the success parameter from the URL
          if (successParam) {
               const newUrl = window.location.pathname;
               window.history.replaceState({}, '', newUrl);
          }
     }, [successParam, onSuccess]);

     const handleDeleteClick = (quotation) => {
          setSelectedQuotation(quotation);
          setOpenDeleteDialog(true);
     };

     const handleDeleteConfirm = async () => {
          try {
               setLoadingAction(true);
               const response = await deleteQuotation(selectedQuotation._id);

               if (response.success) {
                    setOpenDeleteDialog(false);
                    onSuccess('Quotation deleted successfully!');
                    // Remove from local state
                    setQuotations(prev => prev.filter(q => q._id !== selectedQuotation._id));
               } else {
                    throw new Error(response.message || 'Failed to delete quotation');
               }
          } catch (error) {
               console.error('Error deleting quotation:', error);
               onError('Failed to delete quotation: ' + error.message);
          } finally {
               setLoadingAction(false);
               setSelectedQuotation(null);
          }
     };

     const handleConvertClick = (quotation) => {
          setSelectedQuotation(quotation);
          setSelectedPaymentMethod('Cash'); // Reset to default
          setOpenConvertDialog(true);
     };

     const handleConvertConfirm = async () => {
          try {
               setLoadingAction(true);
               const response = await convertToInvoice(selectedQuotation._id, selectedPaymentMethod);

               if (response.success) {
                    setOpenConvertDialog(false);

                    // Show success message with option to view the new invoice
                    const successMessage = response.message || 'Quotation converted to invoice successfully!';
                    onSuccess(`${successMessage} You can view it in the Invoices section.`);

                    // Update status in local state to reflect conversion
                    setQuotations(prev => prev.map(q =>
                         q._id === selectedQuotation._id ? { ...q, status: 'CONVERTED' } : q
                    ));

                    // Refresh the page to get updated data after a short delay
                    setTimeout(() => {
                         window.location.reload();
                    }, 2000);
               } else {
                    // Handle different types of validation errors
                    if (Array.isArray(response.message)) {
                         const inventoryErrors = response.message.join(', ');
                         onError(`Insufficient inventory: ${inventoryErrors}`);
                    } else if (response.message.includes('already been converted')) {
                         onError('This quotation has already been converted to an invoice.');
                    } else if (response.message.includes('expired')) {
                         onError(`Cannot convert expired quotation: ${response.message}`);
                    } else if (response.message.includes('not found')) {
                         onError('Quotation not found. Please refresh the page and try again.');
                    } else if (response.message.includes('not authorized')) {
                         onError('You are not authorized to convert this quotation.');
                    } else if (response.message.includes('Only Open, Sent, Accepted, or Drafted')) {
                         onError(`${response.message}`);
                    } else {
                         onError(response.message || 'Failed to convert quotation to invoice');
                    }
               }
          } catch (error) {
               console.error('Error converting quotation:', error);
               // Handle different types of errors
               if (error.message.includes('inventory') || error.message.includes('quantity')) {
                    onError('Insufficient inventory to convert quotation: ' + error.message);
               } else {
                    onError('Failed to convert quotation: ' + error.message);
               }
          } finally {
               setLoadingAction(false);
               setSelectedQuotation(null);
          }
     };

     const canConvertQuotation = (quotation) => {
          // Check if quotation is already converted
          if (quotation?.status === 'CONVERTED') {
               return { canConvert: false, reason: 'Already converted' };
          }

          // Check if quotation has expired (either by status or date)
          if (quotation?.status === 'EXPIRED' || (quotation?.due_date && isExpired(quotation.due_date))) {
               return { canConvert: false, reason: 'Quotation expired' };
          }

          // Check if quotation status allows conversion
          const allowedStatuses = ['Open', 'SENT', 'ACCEPTED', 'DRAFTED'];
          if (quotation?.status && !allowedStatuses.includes(quotation.status)) {
               return { canConvert: false, reason: 'Invalid status' };
          }

          return { canConvert: true, reason: null };
     };

     // Define columns for the table
     const columns = [
          {
               key: 'quotationNumber',
               visible: true,
               label: 'Quotation No',
               sortable: true,
               align: 'center',
               renderCell: (row) => (
                    <Link href={`/quotations/quotation-view/${row._id}`} passHref>
                         <Typography
                              className="cursor-pointer text-primary hover:underline"
                              align='center'
                         >
                              {row.quotation_id || 'N/A'}
                         </Typography>
                    </Link>
               ),
          },
          {
               key: 'customer',
               visible: true,
               label: 'Customer',
               sortable: true,
               align: 'center',
               renderCell: (row) => (
                    <Box className="flex justify-between items-start flex-col gap-1">
                         <Link href={`/customers/customer-view/${row.customerId?._id}`} passHref>
                              <Typography
                                   variant="body1"
                                   className='text-[0.95rem] text-start cursor-pointer text-primary hover:underline'
                              >
                                   {row.customerId?.name || 'N/A'}
                              </Typography>
                         </Link>
                         <Typography
                              variant="caption"
                              color="text.secondary"
                              className='text-[0.85rem] truncate select-text'
                              sx={{ userSelect: 'text', cursor: 'text' }}
                         >
                              {row.customerId?.phone || 'N/A'}
                         </Typography>
                    </Box>
               ),
          },
          {
               key: 'amount',
               label: 'Amount',
               visible: true,
               align: 'center',
               renderCell: (row) => (
                    <div className="flex items-center gap-1 justify-center">
                         <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
                         <Typography color="text.primary" className='text-[1rem] font-medium'>
                              {formatNumber(row.TotalAmount)}
                         </Typography>
                    </div>
               ),
          },
          {
               key: 'expiryDate',
               label: 'Expiry Date',
               visible: true,
               align: 'center',
               sortable: true,
               renderCell: (row) => (
                    <Chip
                         label={formatDate(row.due_date)}
                         size="medium"
                         variant="outlined"
                         color={isExpired(row.due_date) ? 'error' : 'default'}
                         sx={{ borderRadius: '8px' }}
                    />
               ),
          },
          {
               key: 'status',
               label: 'Status',
               visible: true,
               align: 'center',
               sortable: true,
               renderCell: (row) => (
                    <Chip
                         label={row.status ? row.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                         size="medium"
                         color={getStatusColor(row.status)}
                         variant="tonal"
                         sx={{ fontWeight: 500 }}
                    />
               ),
          },
          {
               key: 'actions',
               label: '',
               visible: true,
               align: 'right',
               renderCell: (row) => {
                    const menuOptions = [];

                    if (permissions.canView) {
                         menuOptions.push({
                              text: 'View',
                              icon: <Icon icon="tabler:eye" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   onClick: () => router.push(`/quotations/quotation-view/${row._id}`)
                              }
                         });
                    }

                    if (permissions.canUpdate) {
                         menuOptions.push({
                              text: 'Edit',
                              icon: <Icon icon="tabler:edit" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   onClick: () => router.push(`/quotations/quotation-edit/${row._id}`)
                              }
                         });
                    }

                    if (permissions.canUpdate) {
                         const convertCheck = canConvertQuotation(row);
                         menuOptions.push({
                              text: convertCheck.canConvert ? 'Convert to Invoice' : convertCheck.reason,
                              icon: <Icon icon="tabler:arrow-right" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   disabled: !convertCheck.canConvert,
                                   onClick: convertCheck.canConvert ? () => handleConvertClick(row) : undefined
                              }
                         });
                    }

                    if (permissions.canDelete) {
                         menuOptions.push({
                              text: 'Delete',
                              icon: <Icon icon="tabler:trash" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   onClick: () => handleDeleteClick(row)
                              }
                         });
                    }

                    if (menuOptions.length === 0) return null;

                    return (
                         <Box className="flex items-center justify-end">
                              <OptionMenu
                                   icon={<MoreVertIcon />}
                                   iconButtonProps={{ size: 'small', 'aria-label': 'quotation actions' }}
                                   options={menuOptions}
                              />
                         </Box>
                    );
               },
          }
     ];

     // Table columns with proper cell handlers  
     const tableColumns = useMemo(() => {
          const cellHandlers = {
               handleDelete: (id) => {
                    const quotation = quotations.find(q => q._id === id);
                    if (quotation) {
                         handleDeleteClick(quotation);
                    }
               },
               handleView: (id) => router.push(`/quotations/quotation-view/${id}`),
               handleEdit: (id) => router.push(`/quotations/quotation-edit/${id}`),
               handleConvert: (id) => {
                    const quotation = quotations.find(q => q._id === id);
                    if (quotation) {
                         handleConvertClick(quotation);
                    }
               },
               permissions,
          };

          return columns.map(col => ({
               ...col,
               renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
          }));
     }, [columns, permissions, quotations, router]);

     const tablePagination = useMemo(() => ({
          page: Math.max(0, pagination.current - 1),
          pageSize: pagination.pageSize,
          total: pagination.total
     }), [pagination.current, pagination.pageSize, pagination.total]);

     return (
          <div className='flex flex-col gap-5'>
               {/* Header Section */}
               <div className="flex justify-start items-center mb-5">
                    <div className="flex items-center gap-2">
                         <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
                              <Icon icon="tabler:file-analytics" fontSize={26} />
                         </Avatar>
                         <Typography variant="h5" className="font-semibold text-primary">
                              Quotations
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Total Quotations"
                                   subtitle="All Quotations"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalQuotations?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalQuotations?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='tabler:file-analytics'
                                   color="primary"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Open Quotations"
                                   subtitle="Active & Pending"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalOpen?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalOpen?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:file-document-outline'
                                   color="info"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Converted"
                                   subtitle="To Invoices"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalConverted?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalConverted?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:check-circle-outline'
                                   color="success"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Expired"
                                   subtitle="Past Due Date"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalExpired?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalExpired?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:clock-alert-outline'
                                   color="error"
                                   iconSize='30px'
                              />
                         </Grid>
                    </Grid>
               </div>

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              addRowButton={
                                   permissions.canCreate && (
                                        <Button
                                             component={Link}
                                             href="/quotations/quotation-add"
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             New Quotation
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={filteredQuotations}
                              loading={loading}
                              pagination={tablePagination}
                              onPageChange={(newPage) => fetchQuotations({ page: newPage + 1 })}
                              onRowsPerPageChange={(pageSize) => fetchQuotations({ page: 1, pageSize })}
                              noDataText="No quotations found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={searchTerm}
                              onSearchChange={(value) => setSearchTerm(value)}
                              searchPlaceholder="Search quotations..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => router.push(`/quotations/quotation-view/${row._id}`)
                                        : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>


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
                              borderRadius: '12px',
                              width: { xs: '90%', sm: 'auto' },
                              minWidth: { sm: 350 },
                              maxWidth: 400
                         }
                    }}
               >
                    <DialogTitle sx={{ px: 3, pt: 3, pb: 1, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         <Icon icon="tabler:arrow-right" fontSize={20} color={theme.palette.primary.main} />
                         Convert to Invoice
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, py: 2 }}>
                         <DialogContentText sx={{ mb: 2, fontSize: '0.875rem' }}>
                              Create an invoice from this quotation?
                         </DialogContentText>

                         <Box sx={{ mb: 2 }}>
                              <FormControl fullWidth size="small">
                                   <InputLabel>Payment Method</InputLabel>
                                   <Select
                                        value={selectedPaymentMethod}
                                        label="Payment Method"
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        disabled={loadingAction}
                                   >
                                        {paymentMethodOptions.map((option) => (
                                             <MenuItem key={option.value} value={option.value}>
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </Select>
                              </FormControl>
                         </Box>

                         {/* Show warning if quotation is close to expiry */}
                         {(() => {
                              const daysUntilExpiry = selectedQuotation?.due_date ?
                                   dayjs(selectedQuotation.due_date).diff(dayjs(), 'day') : null;

                              if (daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
                                   return (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                             <Typography variant="caption">
                                                  Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                                             </Typography>
                                        </Alert>
                                   );
                              }
                              return null;
                         })()}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                         <Button
                              onClick={() => setOpenConvertDialog(false)}
                              color="secondary"
                              size="small"
                              disabled={loadingAction}
                              sx={{ borderRadius: '8px' }}
                         >
                              Cancel
                         </Button>
                         <Button
                              onClick={handleConvertConfirm}
                              variant="contained"
                              size="small"
                              disabled={loadingAction || !selectedPaymentMethod}
                              startIcon={loadingAction && <CircularProgress size={16} />}
                              sx={{ borderRadius: '8px', ml: 1 }}
                         >
                              {loadingAction ? 'Converting...' : 'Convert'}
                         </Button>
                    </DialogActions>
               </Dialog>

               <AppSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
                    autoHideDuration={6000}
               />
          </div>
     );
};

export default ListQuotation;
