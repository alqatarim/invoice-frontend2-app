import { useState, useCallback, useEffect } from 'react'
import { filterCustomers } from '@/app/(dashboard)/customers/actions'

/**
 * Filter handler for managing customer list filters
 */
export const useFilterHandler = ({
  initialFilters,
  setCustomers,
  setPagination,
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
      const formData = new FormData()

      // Add customer IDs if any
      if (tempFilters.customerId && tempFilters.customerId.length > 0) {
        tempFilters.customerId.forEach(id => formData.append('customerId', id))
      }

      // Add search term
      if (tempFilters.search) {
        formData.append('search', tempFilters.search)
      }

      const result = await filterCustomers(formData)

      if (result.success) {
        setCustomers(result.data || [])
        setPagination(prev => ({ ...prev, current: 1, total: result.data?.length || 0 }))
        setFilters(tempFilters)
        setFilterOpen(false)
      } else {
        onError(result.error || 'Failed to apply filters')
      }
    } catch (error) {
      console.error('Error applying filters:', error)
      onError(error.message || 'Failed to apply filters')
    }
  }, [tempFilters, setCustomers, setPagination, onError])

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
    const formData = new FormData()
    const result = await filterCustomers(formData)

    if (result.success) {
      setCustomers(result.data || [])
      setPagination(prev => ({ ...prev, current: 1, total: result.data?.length || 0 }))
    }
  }, [handleResetFilter, setCustomers, setPagination])

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