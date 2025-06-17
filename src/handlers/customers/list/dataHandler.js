import { useState, useCallback } from 'react'
import { getFilteredCustomers } from '@/app/(dashboard)/customers/actions'

/**
 * Data handler for managing customer list data state and fetching
 */
export const useDataHandler = ({
  initialCustomers,
  initialPagination,
  initialTab,
  initialFilters,
  initialSortBy,
  initialSortDirection,
  onError,
  onSuccess
}) => {
  // State management
  const [customers, setCustomers] = useState(initialCustomers || [])
  const [pagination, setPagination] = useState(initialPagination || { current: 1, pageSize: 10, total: 0 })
  const [tab, setTab] = useState(initialTab || 'ALL')
  const [filters, setFilters] = useState(initialFilters || {})
  const [sortBy, setSortBy] = useState(initialSortBy || '')
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc')
  const [loading, setLoading] = useState(false)

    // Fetch customers data
  const fetchCustomers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      // Prepare filter object
      const filterParams = {
        search: params.search || filters.search,
        status: []
      }

      // Handle status filtering based on tab
      if (params.status) {
        filterParams.status = [params.status]
      } else if (tab !== 'ALL') {
        const status = tab === 'ACTIVE' ? 'Active' : tab === 'INACTIVE' ? 'Deactive' : ''
        if (status) filterParams.status = [status]
      }

      const result = await getFilteredCustomers(
        params.page || pagination.current,
        params.limit || pagination.pageSize,
        filterParams,
        params.sortBy || sortBy,
        params.sortDirection || sortDirection
      )

      setCustomers(result.customers || [])
      setPagination(result.pagination || {
        current: params.page || pagination.current,
        pageSize: params.limit || pagination.pageSize,
        total: 0
      })
      return { success: true, data: result.customers }
    } catch (error) {
      console.error('Error fetching customers:', error)
      onError(error.message || 'Failed to fetch customers')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [pagination, filters, tab, sortBy, sortDirection, onError])

  // Handle pagination change
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }))
    fetchCustomers({ page: newPage })
  }, [fetchCustomers])

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }))
    fetchCustomers({ limit: newSize, page: 1 })
  }, [fetchCustomers])

  // Handle tab change
  const handleTabChange = useCallback((newTab) => {
    setTab(newTab)
    setPagination(prev => ({ ...prev, current: 1 }))

    let status = ''
    if (newTab === 'ACTIVE') status = 'Active'
    else if (newTab === 'INACTIVE') status = 'Deactive'

    fetchCustomers({ page: 1, status })
  }, [fetchCustomers])

  // Handle sort change
  const handleSortChange = useCallback((column, direction) => {
    setSortBy(column)
    setSortDirection(direction)
    fetchCustomers({ sortBy: column, sortDirection: direction })
  }, [fetchCustomers])

  return {
    // State
    customers,
    pagination,
    tab,
    filters,
    sortBy,
    sortDirection,
    loading,

    // Setters
    setCustomers,
    setPagination,
    setTab,
    setFilters,
    setSortBy,
    setSortDirection,
    setLoading,

    // Actions
    fetchCustomers,
    handlePageChange,
    handlePageSizeChange,
    handleTabChange,
    handleSortChange
  }
}