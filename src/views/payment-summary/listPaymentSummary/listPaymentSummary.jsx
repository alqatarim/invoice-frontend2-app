'use client';

import React, { useState, useMemo, useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Avatar,
     Box,
     Button,
     Card,
     Chip,
     IconButton,
     Menu,
     MenuItem,
     Typography,
     useMediaQuery,
     Grid,
     Snackbar,
     Alert
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

     const [selectedPayment, setSelectedPayment] = useState(null);
     const [actionAnchorEl, setActionAnchorEl] = useState(null);

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

     const handleActionClick = (event, payment) => {
          setSelectedPayment(payment);
          setActionAnchorEl(event.currentTarget);
     };

     const handleActionClose = () => {
          setActionAnchorEl(null);
     };

     const handleExport = () => {
          // Export functionality would be implemented here
          console.log('Export payment summary');
          enqueueSnackbar && enqueueSnackbar('Export functionality not yet implemented', { variant: 'info' });
     };

     // Get columns from external file
     const columns = useMemo(() =>
          getPaymentSummaryColumns(theme, handleActionClick),
          [theme, handleActionClick]
     );

     // Table columns with proper cell handlers  
     const tableColumns = useMemo(() => {
          return columns.map(col => ({
               ...col,
               renderCell: col.renderCell ? (row, index) => col.renderCell(row, { permissions }, index) : undefined
          }));
     }, [columns, permissions]);

     const tablePagination = useMemo(() => ({
          page: 0,
          pageSize: 10,
          total: filteredPaymentSummaries.length
     }), [filteredPaymentSummaries.length]);

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
                              onPageChange={(page) => {/* pagination handler if needed */ }}
                              onRowsPerPageChange={(size) => {/* page size handler if needed */ }}
                              noDataText="No payment summaries found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={searchTerm}
                              onSearchChange={(value) => setSearchTerm(value)}
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
                         href={`/payment-summary/payment-summary-view/${selectedPayment?._id}`}
                         onClick={handleActionClose}
                         sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
                    >
                         <Icon icon="tabler:eye" fontSize={20} style={{ marginRight: '12px' }} />
                         View Details
                    </MenuItem>
                    <MenuItem
                         onClick={() => {
                              console.log('Export single payment');
                              handleActionClose();
                         }}
                         sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
                    >
                         <Icon icon="tabler:download" fontSize={20} style={{ marginRight: '12px' }} />
                         Export Details
                    </MenuItem>
                    <MenuItem
                         onClick={() => {
                              window.print();
                              handleActionClose();
                         }}
                         sx={{ py: 1.5, pl: 2.5, pr: 3, borderRadius: '8px', mx: 1, my: 0.5 }}
                    >
                         <Icon icon="tabler:printer" fontSize={20} style={{ marginRight: '12px' }} />
                         Print
                    </MenuItem>
               </Menu>

               {/* Snackbar */}
               <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                    <Alert
                         onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                         severity={snackbar.severity}
                         variant="filled"
                         sx={{ width: '100%' }}
                    >
                         {snackbar.message}
                    </Alert>
               </Snackbar>
          </div>
     );
};

export default ListPaymentSummary;
