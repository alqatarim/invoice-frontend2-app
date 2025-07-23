import { useState, useMemo, useCallback, useEffect } from 'react'
import moment from 'moment'
import { statusOptions } from '@/data/dataSets'

/**
 * Overview handler for managing search, pagination, and data filtering
 */
export const useOverviewHandlers = ({ invoices = [], cardDetails }) => {
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 })

  // Reset pagination when search value changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0 }))
  }, [searchValue])

  // Get status label helper
  const getStatusLabel = useMemo(() => (status) => {
    const statusUpper = status?.toUpperCase()
    const statusOption = statusOptions.find(option => option.value === statusUpper)
    return statusOption?.label || status || 'Unpaid'
  }, [])

  // Filter invoices based on search
  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice =>
      invoice.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
      getStatusLabel(invoice.status).toLowerCase().includes(searchValue.toLowerCase()) ||
      moment(invoice.invoiceDate).format('MMM DD, YYYY').toLowerCase().includes(searchValue.toLowerCase())
    ), [invoices, searchValue, getStatusLabel]
  )

  // Update pagination total when filtered
  const updatedPagination = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: filteredInvoices.length
  }), [pagination.page, pagination.pageSize, filteredInvoices.length])

  // Handle pagination changes
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handleRowsPerPageChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 0 }))
  }, [])

  // Handle search changes
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value)
  }, [])

  // Row key function
  const getRowKey = useMemo(() => (row) => row._id, [])

  // Total amount for display
  // const totalAmount = useMemo(() =>
  //   cardDetails?.totalRecs?.[0]?.amount || 0,
  //   [cardDetails?.totalRecs]
  // )

  return {
    // State
    searchValue,
    pagination: updatedPagination,
    filteredInvoices,
    // totalAmount,
    
    // Actions
    handlePageChange,
    handleRowsPerPageChange,
    handleSearchChange,
    getRowKey,
    getStatusLabel
  }
} 