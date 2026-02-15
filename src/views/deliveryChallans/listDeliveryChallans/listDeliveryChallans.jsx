'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Avatar,
     Box,
     Button,
     Card,
     Chip,
     Dialog,
     DialogActions,
     DialogContent,
     DialogContentText,
     DialogTitle,
     Typography,
     useMediaQuery,
     Grid,
     
} from '@mui/material';
import { Icon } from '@iconify/react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { formatDate } from '@/utils/dateUtils';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/currencyUtils';
import { deleteDeliveryChallan, convertToInvoice, getFilteredDeliveryChallans } from '@/app/(dashboard)/deliveryChallans/actions';
import CustomListTable from '@/components/custom-components/CustomListTable';
import OptionMenu from '@core/components/option-menu';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { deliveryChallanStatusOptions } from '@/data/dataSets';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

// Helper function to get status color
const getStatusColor = (status) => {
     const statusOption = deliveryChallanStatusOptions.find(opt => opt.value === status);
     return statusOption?.color || 'default';
};

// Format number helper function
const formatNumber = (value) => {
     if (value === null || value === undefined) return '0.00';
     const num = typeof value === 'string' ? parseFloat(value) : value;
     return isNaN(num) ? '0.00' : Number(num).toFixed(2);
};

const ListDeliveryChallans = ({ initialData, customers }) => {
     const theme = useTheme();
     const router = useRouter();
     const searchParams = useSearchParams();
     const { data: session } = useSession();
     const successParam = searchParams.get('success');
     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

     // Permissions
     const permissions = {
          canCreate: usePermission('deliveryChallan', 'create'),
          canUpdate: usePermission('deliveryChallan', 'update'),
          canView: usePermission('deliveryChallan', 'view'),
          canDelete: usePermission('deliveryChallan', 'delete'),
     };

     const [deliveryChallans, setDeliveryChallans] = useState(initialData?.data || []);
     const [searchTerm, setSearchTerm] = useState('');
     const [filteredDeliveryChallans, setFilteredDeliveryChallans] = useState(initialData?.data || []);
     const [loading, setLoading] = useState(false);
     const [pagination, setPagination] = useState({
          current: 1,
          pageSize: 10,
          total: initialData?.totalRecords || initialData?.data?.length || 0
     });

     const [selectedDeliveryChallan, setSelectedDeliveryChallan] = useState(null);
     const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
     const [openConvertDialog, setOpenConvertDialog] = useState(false);
     const [loadingAction, setLoadingAction] = useState(false);

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

     // Calculate manual card counts from the data
     const cardCounts = {
          totalActive: {
               count: deliveryChallans.filter(dc => dc.status === 'ACTIVE').length,
               total_sum: deliveryChallans.filter(dc => dc.status === 'ACTIVE').reduce((sum, dc) => sum + (Number(dc.TotalAmount) || 0), 0)
          },
          totalConverted: {
               count: deliveryChallans.filter(dc => dc.status === 'CONVERTED').length,
               total_sum: deliveryChallans.filter(dc => dc.status === 'CONVERTED').reduce((sum, dc) => sum + (Number(dc.TotalAmount) || 0), 0)
          },
          totalCancelled: {
               count: deliveryChallans.filter(dc => dc.status === 'CANCELLED').length,
               total_sum: deliveryChallans.filter(dc => dc.status === 'CANCELLED').reduce((sum, dc) => sum + (Number(dc.TotalAmount) || 0), 0)
          },
          totalDeliveryChallans: {
               count: deliveryChallans.length,
               total_sum: deliveryChallans.reduce((sum, dc) => sum + (Number(dc.TotalAmount) || 0), 0)
          }
     };

     const fetchDeliveryChallans = useCallback(async ({ page = pagination.current, pageSize = pagination.pageSize } = {}) => {
          setLoading(true);
          try {
               const response = await getFilteredDeliveryChallans('ALL', page, pageSize, {});
               const nextData = response?.deliveryChallans || [];
               const nextPagination = response?.pagination || {
                    current: page,
                    pageSize,
                    total: response?.totalRecords || nextData.length
               };
               setDeliveryChallans(nextData);
               setPagination(nextPagination);
               setFilteredDeliveryChallans(nextData);
          } catch (error) {
               onError(error.message || 'Failed to load delivery challans');
          } finally {
               setLoading(false);
          }
     }, [onError, pagination.current, pagination.pageSize]);

     useEffect(() => {
          if ((initialData?.data || []).length > 0) return;
          fetchDeliveryChallans();
     }, [fetchDeliveryChallans, initialData?.data]);

     // Search functionality
     useEffect(() => {
          if (!searchTerm) {
               setFilteredDeliveryChallans(deliveryChallans);
          } else {
               const filtered = deliveryChallans.filter(challan =>
                    challan.challanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    challan.deliveryChallanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    challan.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    challan.customerId?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
               );
               setFilteredDeliveryChallans(filtered);
          }
     }, [searchTerm, deliveryChallans]);

     // Show success message if redirected from add/edit page
     useEffect(() => {
          if (successParam === 'add') {
               onSuccess('Delivery challan added successfully!');
          } else if (successParam === 'edit') {
               onSuccess('Delivery challan updated successfully!');
          } else if (successParam === 'delete') {
               onSuccess('Delivery challan deleted successfully!');
          } else if (successParam === 'convert') {
               onSuccess('Delivery challan converted to invoice successfully!');
          }

          // Clear the success parameter from the URL
          if (successParam) {
               const newUrl = window.location.pathname;
               window.history.replaceState({}, '', newUrl);
          }
     }, [successParam, onSuccess]);

     const handleDeleteClick = (deliveryChallan) => {
          setSelectedDeliveryChallan(deliveryChallan);
          setOpenDeleteDialog(true);
     };

     const handleDeleteConfirm = async () => {
          try {
               setLoadingAction(true);
               const response = await deleteDeliveryChallan(selectedDeliveryChallan._id);

               if (response.success) {
                    setOpenDeleteDialog(false);
                    onSuccess('Delivery challan deleted successfully!');
                    // Remove from local state
                    setDeliveryChallans(prev => prev.filter(dc => dc._id !== selectedDeliveryChallan._id));
               } else {
                    throw new Error(response.message || 'Failed to delete delivery challan');
               }
          } catch (error) {
               console.error('Error deleting delivery challan:', error);
               onError('Failed to delete delivery challan: ' + error.message);
          } finally {
               setLoadingAction(false);
               setSelectedDeliveryChallan(null);
          }
     };

     const handleConvertClick = (deliveryChallan) => {
          setSelectedDeliveryChallan(deliveryChallan);
          setOpenConvertDialog(true);
     };

     const handleConvertConfirm = async () => {
          try {
               setLoadingAction(true);
               const response = await convertToInvoice(selectedDeliveryChallan._id);

               if (response.success) {
                    setOpenConvertDialog(false);
                    onSuccess('Delivery challan converted to invoice successfully!');
                    // Update status in local state
                    setDeliveryChallans(prev => prev.map(dc =>
                         dc._id === selectedDeliveryChallan._id ? { ...dc, status: 'CONVERTED' } : dc
                    ));
               } else {
                    throw new Error(response.message || 'Failed to convert delivery challan to invoice');
               }
          } catch (error) {
               console.error('Error converting delivery challan:', error);
               onError('Failed to convert delivery challan: ' + error.message);
          } finally {
               setLoadingAction(false);
               setSelectedDeliveryChallan(null);
          }
     };

     // Define columns for the table
     const columns = [
          {
               key: 'challanNumber',
               visible: true,
               label: 'Challan No',
               sortable: true,
               align: 'center',
               renderCell: (row) => (
                    <Link href={`/deliveryChallans/deliveryChallans-view/${row._id}`} passHref>
                         <Typography
                              className="cursor-pointer text-primary hover:underline"
                              align='center'
                         >
                              {row.challanNumber || row.deliveryChallanNumber || 'N/A'}
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
                              {formatNumber(row.TotalAmount || row.totalAmount)}
                         </Typography>
                    </div>
               ),
          },
          {
               key: 'deliveryDate',
               label: 'Delivery Date',
               visible: true,
               align: 'center',
               sortable: true,
               renderCell: (row) => (
                    <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
                         {row.deliveryDate ? formatDate(row.deliveryDate) : 'N/A'}
                    </Typography>
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
                                   onClick: () => router.push(`/deliveryChallans/deliveryChallans-view/${row._id}`)
                              }
                         });
                    }

                    if (permissions.canUpdate) {
                         menuOptions.push({
                              text: 'Edit',
                              icon: <Icon icon="tabler:edit" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   onClick: () => router.push(`/deliveryChallans/deliveryChallans-edit/${row._id}`)
                              }
                         });

                         menuOptions.push({
                              text: 'Convert to Invoice',
                              icon: <Icon icon="tabler:arrow-right" />,
                              menuItemProps: {
                                   className: 'flex items-center gap-2 text-textSecondary',
                                   disabled: row?.status === 'CONVERTED',
                                   onClick: row?.status === 'CONVERTED' ? undefined : () => handleConvertClick(row)
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
                                   iconButtonProps={{ size: 'small', 'aria-label': 'delivery challan actions' }}
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
                    const challan = deliveryChallans.find(dc => dc._id === id);
                    if (challan) {
                         handleDeleteClick(challan);
                    }
               },
               handleView: (id) => router.push(`/deliveryChallans/deliveryChallans-view/${id}`),
               handleEdit: (id) => router.push(`/deliveryChallans/deliveryChallans-edit/${id}`),
               handleConvert: (id) => {
                    const challan = deliveryChallans.find(dc => dc._id === id);
                    if (challan) {
                         handleConvertClick(challan);
                    }
               },
               permissions,
          };

          return columns.map(col => ({
               ...col,
               renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
          }));
     }, [columns, permissions, deliveryChallans, router]);

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
                              <Icon icon="tabler:truck-delivery" fontSize={26} />
                         </Avatar>
                         <Typography variant="h5" className="font-semibold text-primary">
                              Delivery Challans
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Total Challans"
                                   subtitle="No of Challans"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalDeliveryChallans?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalDeliveryChallans?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='tabler:truck-delivery'
                                   color="primary"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Active"
                                   subtitle="No of Active"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalActive?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalActive?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:check-circle-outline'
                                   color="success"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Converted"
                                   subtitle="No of Converted"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalConverted?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalConverted?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:arrow-right-circle-outline'
                                   color="info"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Cancelled"
                                   subtitle="No of Cancelled"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalCancelled?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalCancelled?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:close-circle-outline'
                                   color="error"
                                   iconSize='35px'
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
                                             href="/deliveryChallans/deliveryChallans-add"
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             New Delivery Challan
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={filteredDeliveryChallans}
                              loading={loading}
                              pagination={tablePagination}
                              onPageChange={(page) => fetchDeliveryChallans({ page: page + 1 })}
                              onRowsPerPageChange={(size) => fetchDeliveryChallans({ page: 1, pageSize: size })}
                              noDataText="No delivery challans found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={searchTerm}
                              onSearchChange={(value) => setSearchTerm(value)}
                              searchPlaceholder="Search delivery challans..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => router.push(`/deliveryChallans/deliveryChallans-view/${row._id}`)
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
                              Are you sure you want to delete this delivery challan? This action cannot be undone.
                         </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
                         <Button
                              onClick={() => setOpenDeleteDialog(false)}
                              variant="outlined"
                              disabled={loadingAction}
                              sx={{ borderRadius: '10px', py: 1, px: 3 }}
                         >
                              Cancel
                         </Button>
                         <Button
                              onClick={handleDeleteConfirm}
                              variant="contained"
                              color="error"
                              disabled={loadingAction}
                              startIcon={loadingAction ? null : <Icon icon="tabler:trash" />}
                              sx={{ borderRadius: '10px', py: 1, px: 3, ml: 2 }}
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
                              Are you sure you want to convert this delivery challan to an invoice? This will create a new invoice with the same details.
                         </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
                         <Button
                              onClick={() => setOpenConvertDialog(false)}
                              variant="outlined"
                              disabled={loadingAction}
                              sx={{ borderRadius: '10px', py: 1, px: 3 }}
                         >
                              Cancel
                         </Button>
                         <Button
                              onClick={handleConvertConfirm}
                              variant="contained"
                              disabled={loadingAction}
                              startIcon={loadingAction ? null : <Icon icon="tabler:arrow-right" />}
                              sx={{ borderRadius: '10px', py: 1, px: 3, ml: 2 }}
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

export default ListDeliveryChallans;
