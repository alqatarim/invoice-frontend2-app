'use client';

import { Box, Typography } from '@mui/material';
import { usePaymentListHandlers } from '@/handlers/payments/usePaymentListHandlers';
import PaymentHead from './paymentHead';
import PaymentFilter from './paymentFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { paymentColumns } from './paymentColumns';

const PaymentList = ({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCustomerOptions = [],
  onSuccess,
  onError,
}) => {
  const handlers = usePaymentListHandlers({
    initialPayments,
    initialPagination,
    initialCustomerOptions,
    onSuccess,
    onError,
  });

  const tableColumns = paymentColumns({
    handleView: handlers.handleView,
    handleEdit: handlers.handleEdit,
    handleDelete: handlers.handleDelete,
  });

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Payments
        </Typography>
      </Box>

      <PaymentHead
        onFilterToggle={handlers.handleFilterToggle}
        isFilterApplied={handlers.isFilterApplied()}
        filterCount={handlers.getFilterCount()}
        onFilterReset={handlers.handleFilterReset}
      />

      <CustomListTable
        columns={tableColumns}
        rows={handlers.payments || []}
        loading={handlers.loading}
        pagination={{
          page: handlers.pagination.current - 1, // Zero-indexed for MUI
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total,
        }}
        onPageChange={handlers.handlePageChange}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        onSort={handlers.handleSortRequest}
        sortBy={handlers.sortBy}
        sortDirection={handlers.sortDirection}
        rowKey={(row, index) => row?._id || row?.id || `payment-${index}`}
        noDataText="No payments found"
      />

      <PaymentFilter
        open={handlers.filterOpen}
        onClose={handlers.handleFilterToggle}
        filterValues={handlers.filterValues}
        onFilterChange={handlers.handleFilterValueChange}
        onApply={handlers.handleFilterApply}
        onReset={handlers.handleFilterReset}
        customerOptions={handlers.customerOptions || []}
        customerSearchLoading={handlers.customerSearchLoading}
        onCustomerSearch={handlers.handleCustomerSearch}
      />
    </Box>
  );
};

export default PaymentList;