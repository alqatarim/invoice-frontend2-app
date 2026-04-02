'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';
import { getPaymentSummaryColumns } from './paymentSummaryColumns';
const ListPaymentSummary = ({
     paymentSummaries = [],
     pagination = { current: 1, pageSize: 10, total: 0 },
     loading = false,
     permissions = {},
     searchTerm = '',
     cardCounts = {},
     onSearchChange,
     onPageChange,
     onRowsPerPageChange,
     onView,
     onExport,
}) => {
     const theme = useTheme();

     const columns = useMemo(
          () =>
               getPaymentSummaryColumns({
                    theme,
                    permissions,
                    onView: (row) => onView(row?._id),
                    onExport,
                    onPrint: () => window.print(),
               }),
          [onExport, onView, permissions, theme]
     );

     const tableColumns = useMemo(
          () =>
               columns.map((column) => ({
                    ...column,
                    renderCell: column.renderCell
                         ? (row, index) => column.renderCell(row, { permissions }, index)
                         : undefined,
               })),
          [columns, permissions]
     );

     const tablePagination = useMemo(
          () => ({
               page: Math.max(0, pagination.current - 1),
               pageSize: pagination.pageSize,
               total: pagination.total,
          }),
          [pagination.current, pagination.pageSize, pagination.total]
     );

     return (
          <div className='flex flex-col gap-5'>
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
                              rows={paymentSummaries}
                              loading={loading}
                              pagination={tablePagination}
                              onPageChange={onPageChange}
                              onRowsPerPageChange={onRowsPerPageChange}
                              noDataText="No payment summaries found"
                              rowKey={(row) => row._id || row.id}
                              showSearch
                              searchValue={searchTerm}
                              onSearchChange={onSearchChange}
                              searchPlaceholder="Search payment summaries..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => onView(row._id)
                                        : undefined
                              }
                              enableHover
                              headerActions={
                                   permissions.canExport && (
                                        <Button
                                             onClick={onExport}
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
          </div>
     );
};

export default ListPaymentSummary;
