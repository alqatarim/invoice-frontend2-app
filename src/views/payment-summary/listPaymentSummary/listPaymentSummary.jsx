'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Avatar,
     Box,
     Button,
     Card,
     Chip,
     Typography,
     useMediaQuery,
     Grid,
     
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { paymentSummaryStatus } from '@/data/dataSets';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';
import { getPaymentSummaryColumns } from './paymentSummaryColumns';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { getFilteredPaymentSummaries } from '@/app/(dashboard)/payment-summary/actions';

// Helper function to get status color
const getStatusColor = (status) => {
     const statusOption = paymentSummaryStatus.find(opt => opt.value === status);
     return statusOption?.color || 'default';
};

// Format number helper function
const formatNumber = (value) => {
     if (value === null || value === undefined) return '0.00';
     const num = typeof value === 'string' ? parseFloat(value) : value;
     return isNaN(num) ? '0.00' : Number(num).toFixed(2);
};

const ListPaymentSummary = ({ initialData, customers }) => {
     const theme = useTheme();
     const router = useRouter();
     const searchParams = useSearchParams();
     const { data: session } = useSession();
     const successParam = searchParams.get('success');
     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

     // Permissions
     const permissions = {
          canView: usePermission('paymentSummary', 'view'),
          canExport: usePermission('paymentSummary', 'export'),
     };

     const [paymentSummaries, setPaymentSummaries] = useState(initialData?.data || []);
     const [searchTerm, setSearchTerm] = useState('');
     const [filteredPaymentSummaries, setFilteredPaymentSummaries] = useState(initialData?.data || []);
     const [loading, setLoading] = useState(false);
     const [pagination, setPagination] = useState({
          current: 1,
          pageSize: 10,
          total: initialData?.totalRecords || initialData?.data?.length || 0
     });

     

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
          totalPaid: {
               count: paymentSummaries.filter(p => p.status === 'Success' || p.status === 'PAID').length,
               total_sum: paymentSummaries.filter(p => p.status === 'Success' || p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          },
          totalRefund: {
               count: paymentSummaries.filter(p => p.status === 'REFUND').length,
               total_sum: paymentSummaries.filter(p => p.status === 'REFUND').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          },
          totalFailed: {
               count: paymentSummaries.filter(p => p.status === 'Failed').length,
               total_sum: paymentSummaries.filter(p => p.status === 'Failed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          },
          totalPayments: {
               count: paymentSummaries.length,
               total_sum: paymentSummaries.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          }
     };

     const fetchPaymentSummaries = useCallback(async ({ page = pagination.current, pageSize = pagination.pageSize } = {}) => {
          setLoading(true);
          try {
               const response = await getFilteredPaymentSummaries(page, pageSize, {});
               const nextData = response?.payments || [];
               setPaymentSummaries(nextData);
               setFilteredPaymentSummaries(nextData);
               setPagination(response?.pagination || {
                    current: page,
                    pageSize,
                    total: response?.totalRecords || nextData.length
               });
          } catch (error) {
               onError(error.message || 'Failed to load payment summaries');
          } finally {
               setLoading(false);
          }
     }, [onError, pagination.current, pagination.pageSize]);

     useEffect(() => {
          if ((initialData?.data || []).length > 0) return;
          fetchPaymentSummaries();
     }, [fetchPaymentSummaries, initialData?.data]);

     // Search functionality
     useEffect(() => {
          if (!searchTerm) {
               setFilteredPaymentSummaries(paymentSummaries);
          } else {
               const filtered = paymentSummaries.filter(payment =>
                    payment.payment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.customerDetail?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.customerDetail?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.customerDetail?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.status?.toLowerCase().includes(searchTerm.toLowerCase())
               );
               setFilteredPaymentSummaries(filtered);
          }
     }, [searchTerm, paymentSummaries]);

     const handleExport = () => {
          // Export functionality would be implemented here
          console.log('Export payment summary');
          enqueueSnackbar && enqueueSnackbar('Export functionality not yet implemented', { variant: 'info' });
     };

     // Get columns from external file
     const columns = useMemo(() =>
          getPaymentSummaryColumns({
               theme,
               permissions,
               onView: (row) => router.push(`/payment-summary/payment-summary-view/${row?._id}`),
               onExport: () => {
                    console.log('Export single payment');
               },
               onPrint: () => window.print(),
          }),
          [theme, permissions, router]
     );

     // Table columns with proper cell handlers  
     const tableColumns = useMemo(() => {
          return columns.map(col => ({
               ...col,
               renderCell: col.renderCell ? (row, index) => col.renderCell(row, { permissions }, index) : undefined
          }));
     }, [columns, permissions]);

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
                              <Icon icon="tabler:credit-card" fontSize={26} />
                         </Avatar>
                         <Typography variant="h5" className="font-semibold text-primary">
                              Payment Summary
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Total Payments"
                                   subtitle="No of Payments"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalPayments?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalPayments?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='tabler:credit-card'
                                   color="primary"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Successful"
                                   subtitle="No of Successful"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalPaid?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalPaid?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:check-circle-outline'
                                   color="success"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Refunds"
                                   subtitle="No of Refunds"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalRefund?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalRefund?.count || 0}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:arrow-left-circle-outline'
                                   color="warning"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Failed"
                                   subtitle="No of Failed"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`$ ${amountFormat(cardCounts.totalFailed?.total_sum)}`}
                                   statsVariant='h4'
                                   trendNumber={cardCounts.totalFailed?.count || 0}
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
                              columns={tableColumns}
                              rows={filteredPaymentSummaries}
                              loading={loading}
                              pagination={tablePagination}
                              onPageChange={(page) => fetchPaymentSummaries({ page: page + 1 })}
                              onRowsPerPageChange={(size) => fetchPaymentSummaries({ page: 1, pageSize: size })}
                              noDataText="No payment summaries found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={searchTerm}
                              onSearchChange={(value) => setSearchTerm(value)}
                              searchPlaceholder="Search payment summaries..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => router.push(`/payment-summary/payment-summary-view/${row._id}`)
                                        : undefined
                              }
                              enableHover
                              headerActions={
                                   permissions.canExport && (
                                        <Button
                                             onClick={handleExport}
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:download" />}
                                        >
                                             Export Summary
                                        </Button>
                                   )
                              }
                         />
                    </Grid>
               </Grid>


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

export default ListPaymentSummary;
