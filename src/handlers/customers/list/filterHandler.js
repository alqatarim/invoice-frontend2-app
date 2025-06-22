import { useState, useCallback } from 'react'

/**
 * Filter handler for managing customer list filters
 */
export const useFilterHandler = ({
  initialFilters,
  fetchCustomers,
  onError
}) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(initialFilters || {
    customerId: [],
    search: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)

  // Toggle filter panel
  const handleFilterToggle = useCallback(() => {
    setFilterOpen(prev => !prev)
  }, [])

  // Update temp filters
  const handleFilterChange = useCallback((filterType, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  // Apply filters
  const handleApplyFilter = useCallback(async () => {
    try {
      setFilters(tempFilters)
      await fetchCustomers({
        page: 1,
        filters: tempFilters
      })
      setFilterOpen(false)
    } catch (error) {
      console.error('Error applying filters:', error)
      onError(error.message || 'Failed to apply filters')
    }
  }, [tempFilters, fetchCustomers, onError])

  // Reset filters
  const handleResetFilter = useCallback(() => {
    const resetFilters = {
      customerId: [],
      search: ''
    }
    setTempFilters(resetFilters)
    setFilters(resetFilters)
  }, [])

  // Clear all filters and refresh
  const handleClearAllFilters = useCallback(async () => {
    handleResetFilter()
    setFilterOpen(false)
    // Fetch all customers without filters
    await fetchCustomers({ page: 1, filters: {} })
  }, [handleResetFilter, fetchCustomers])

  // Update search filter
  const handleSearchChange = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setTempFilters(prev => ({ ...prev, search: searchTerm }))
  }, [])

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0
    if (filters.customerId && filters.customerId.length > 0) count++
    if (filters.search) count++
    return count
  }, [filters])

  return {
    // State
    filterOpen,
    filters,
    tempFilters,

    // Actions
    handleFilterToggle,
    handleFilterChange,
    handleApplyFilter,
    handleResetFilter,
    handleClearAllFilters,
    handleSearchChange,
    getActiveFilterCount
  }
}