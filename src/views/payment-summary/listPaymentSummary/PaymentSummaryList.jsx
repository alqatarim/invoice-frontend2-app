'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import PaymentSummaryHead from './PaymentSummaryHead'
import PaymentSummaryFilter from './PaymentSummaryFilter'
import PaymentSummaryColumns from './PaymentSummaryColumns'
import CustomListTable from '@/components/custom-components/CustomListTable'

const PaymentSummaryList = (props) => {
  const {
    paymentSummaries,
    pagination,
    loading,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    sortBy,
    sortDirection,
    availableColumns,
    manageColumnsOpen,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnCheckboxChange,
    handleManageColumnsSave,
    filterOpen,
    handleFilterToggle,
    handleFilterApply,
    handleFilterReset,
    hasActiveFilters,
    customerOptions,
    customerSearchLoading,
    handleCustomerSearch,
    selectedCustomers,
    handleCustomerSelection,
    handleView,
    handleDelete,
    handleStatusUpdate,
  } = props

  const columns = PaymentSummaryColumns({
    availableColumns,
    handleView,
    handleDelete,
    handleStatusUpdate,
  })

  return (
    <Box>
      <PaymentSummaryHead
        onFilterClick={handleFilterToggle}
        isFilterApplied={hasActiveFilters()}
      />

      <Card sx={{ mt: 4 }}>
        <CustomListTable
          rows={paymentSummaries || []}
          columns={columns}
          loading={loading}
          pagination={{
            page: pagination.current - 1, // Convert to 0-based for MUI
            pageSize: pagination.pageSize,
            totalRecords: pagination.total,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortRequest={handleSortRequest}
          sortBy={sortBy}
          sortDirection={sortDirection}
          rowKey={(row, index) => row?._id || row?.id || `payment-summary-${index}`}
          handleManageColumnsOpen={handleManageColumnsOpen}
          manageColumnsOpen={manageColumnsOpen}
          handleManageColumnsClose={handleManageColumnsClose}
          handleColumnCheckboxChange={handleColumnCheckboxChange}
          handleManageColumnsSave={handleManageColumnsSave}
          availableColumns={availableColumns}
        />
      </Card>

      <PaymentSummaryFilter
        open={filterOpen}
        onClose={handleFilterToggle}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        customerOptions={customerOptions}
        customerSearchLoading={customerSearchLoading}
        handleCustomerSearch={handleCustomerSearch}
        selectedCustomers={selectedCustomers}
        handleCustomerSelection={handleCustomerSelection}
      />
    </Box>
  )
}

export default PaymentSummaryList