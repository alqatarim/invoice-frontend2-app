'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
     Button,
     Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import CustomListTable from '@/components/custom-components/CustomListTable';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
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

     const tableColumns = useMemo(
          () =>
               getPaymentSummaryColumns({
                    theme,
                    permissions,
                    onView,
                    onExport,
                    onPrint: () => window.print(),
               }),
          [onExport, onView, permissions, theme]
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
               <PageIconHeader title='Payment Summary' icon='tabler:credit-card' />

               <div className="mb-2">
                    <Grid container className='flex flex-wrap justify-between gap-0'>
                         {[
                              {
                                   title: 'Total',
                                   value: cardCounts.totalPayments?.total_sum || 0,
                                   // subtitle: `${cardCounts.totalPayments?.count || 0} payments`,
                                   icon: 'tabler:credit-card',
                                   color: 'primary',
                                   isCurrency: true,
                              },
                              {
                                   title: 'Successful',
                                   value: cardCounts.totalPaid?.total_sum || 0,
                                   // subtitle: `${cardCounts.totalPaid?.count || 0} successful`,
                                   icon: 'mdi:check-circle-outline',
                                   color: 'success',
                                   isCurrency: true,
                              },
                              {
                                   title: 'Refunds',
                                   value: cardCounts.totalRefund?.total_sum || 0,
                                   // subtitle: `${cardCounts.totalRefund?.count || 0} refunds`,
                                   icon: 'mdi:arrow-left-circle-outline',
                                   color: 'warning',
                                   isCurrency: true,
                              },
                              {
                                   title: 'Failed',
                                   value: cardCounts.totalFailed?.total_sum || 0,
                                   // subtitle: `${cardCounts.totalFailed?.count || 0} failed`,
                                   icon: 'mdi:close-circle-outline',
                                   color: 'error',
                                   isCurrency: true,
                              },
                         ].map((card) => (
                              <Grid key={card.title}>
                                   <HorizontalWithoutBorder {...card} />
                              </Grid>
                         ))}
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
