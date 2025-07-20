import { useState, useCallback, useRef, useEffect } from 'react'
import { getFilteredCustomers } from '@/app/(dashboard)/customers/actions'

/**
 * Consolidated data handler for managing customer list data and search
 */
export const useDataHandler = ({
  initialCustomers,
  initialPagination,
  initialSortBy,
  initialSortDirection,
  onError,
  onSuccess
}) => {
  // Data state management
  const [customers, setCustomers] = useState(initialCustomers || [])
  const [pagination, setPagination] = useState(initialPagination || { current: 1, pageSize: 10, total: 0 })
  const [sortBy, setSortBy] = useState(initialSortBy || '')
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc')
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  // Search state management
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)

  // Use refs to access latest state values without causing re-renders
  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy,
    sortDirection
  })

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy,
      sortDirection
    }
  }, [searchTerm, pagination, sortBy, sortDirection])

  // Fetch customers data - now using refs to avoid dependency issues
  const fetchCustomers = useCallback(async (params = {}) => {
    if (loadingRef.current) return // Prevent multiple simultaneous calls
    
    loadingRef.current = true
    setLoading(true)
    
    try {
      const currentState = stateRef.current
      
      // Prepare API parameters
      const apiParams = {
        skip: ((params.page || currentState.pagination.current) - 1) * (params.limit || currentState.pagination.pageSize),
        limit: params.limit || currentState.pagination.pageSize,
      }

      // Add search parameter if provided
      if (params.search !== undefined || currentState.searchTerm) {
        apiParams.search_customer = params.search !== undefined ? params.search : currentState.searchTerm
      }

      // Add sorting parameters if provided
      if (params.sortBy !== undefined || currentState.sortBy) {
        apiParams.sortBy = params.sortBy !== undefined ? params.sortBy : currentState.sortBy
      }
      
      if (params.sortDirection !== undefined || currentState.sortDirection) {
        apiParams.sortDirection = params.sortDirection !== undefined ? params.sortDirection : currentState.sortDirection
      }

      const result = await getFilteredCustomers(apiParams)

      setCustomers(result.customers || [])
      setPagination(prev => ({
        current: params.page || prev.current,
        pageSize: params.limit || prev.pageSize,
        total: result.total || 0
      }))
      return { success: true, data: result.customers }
    } catch (error) {
      console.error('Error fetching customers:', error)
      onError(error.message || 'Failed to fetch customers')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [onError])

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

  // Handle sort change
  const handleSortChange = useCallback((column, direction) => {
    setSortBy(column)
    setSortDirection(direction)
    fetchCustomers({ sortBy: column, sortDirection: direction })
  }, [fetchCustomers])

  // Search handlers
  const handleSearchInputChange = useCallback(async (value) => {
    // Don't do anything if the value hasn't actually changed
    if (value === stateRef.current.searchTerm) return
    
    setSearching(true)
    setSearchTerm(value)
    
    try {
      // Fetch customers with the new search value
      await fetchCustomers({ 
        search: value, 
        page: 1
      })
    } catch (error) {
      console.error('Error searching customers:', error)
      onError(error.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }, [fetchCustomers, onError])

  const handleSearchSubmit = useCallback(async (event) => {
    event.preventDefault()
    setSearching(true)

    try {
      await fetchCustomers({ search: searchTerm, page: 1 })
    } catch (error) {
      console.error('Error submitting search:', error)
      onError(error.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }, [searchTerm, fetchCustomers, onError])

  const handleSearchClear = useCallback(async () => {
    setSearchTerm('')
    setSearching(true)

    try {
      await fetchCustomers({ search: '', page: 1 })
    } catch (error) {
      console.error('Error clearing search:', error)
      onError(error.message || 'Failed to clear search')
    } finally {
      setSearching(false)
    }
  }, [fetchCustomers, onError])

  const handleSearchFocus = useCallback(() => {
    // Additional focus logic if needed
  }, [])

  const handleSearchBlur = useCallback(() => {
    // Additional blur logic if needed
  }, [])

  return {
    // Data state
    customers,
    pagination,
    sortBy,
    sortDirection,
    loading,

    // Search state
    searchTerm,
    searching,

    // Data setters
    setCustomers,
    setPagination,
    setSortBy,
    setSortDirection,
    setLoading,

    // Data actions
    fetchCustomers,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,

    // Search actions
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,
    handleSearchFocus,
    handleSearchBlur,
    setSearchTerm
  }
}