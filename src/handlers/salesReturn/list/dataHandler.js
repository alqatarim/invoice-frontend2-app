import { useState, useCallback, useRef, useEffect } from 'react'
import { getSalesReturnList } from '@/app/(dashboard)/sales-return/actions'

/**
 * Consolidated data handler for managing sales return list data and search
 */
export const useDataHandler = ({
     initialSalesReturns,
     initialPagination,
     initialSortBy,
     initialSortDirection,
     onError,
     onSuccess
}) => {
     // Data state management - use initial data as primary source
     const [salesReturns, setSalesReturns] = useState(initialSalesReturns || [])
     const [pagination, setPagination] = useState(() => {
          // Ensure total matches initial data length if provided
          const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 }
          if (initialSalesReturns && initialSalesReturns.length > 0 && basePagination.total === 0) {
               return { ...basePagination, total: initialSalesReturns.length }
          }
          return basePagination
     })
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

     // Fetch sales returns data - only when needed (pagination, search, etc.)
     const fetchSalesReturns = useCallback(async (params = {}) => {
          if (loadingRef.current) return // Prevent multiple simultaneous calls

          loadingRef.current = true
          setLoading(true)

          try {
               const currentState = stateRef.current

               // Prepare API parameters
               const page = params.page || currentState.pagination.current
               const limit = params.limit || currentState.pagination.pageSize

               const response = await getSalesReturnList(page, limit)

               if (response?.success) {
                    setSalesReturns(response.data || [])
                    setPagination(prev => ({
                         current: params.page || prev.current,
                         pageSize: params.limit || prev.pageSize,
                         total: response.totalRecords || 0
                    }))
                    return { success: true, data: response.data }
               } else {
                    setSalesReturns([])
                    setPagination(prev => ({ ...prev, total: 0 }))
                    throw new Error(response.message || 'Failed to fetch sales returns')
               }
          } catch (error) {
               console.error('Error fetching sales returns:', error)
               onError(error.message || 'Failed to fetch sales returns')
               return { success: false, error: error.message }
          } finally {
               setLoading(false)
               loadingRef.current = false
          }
     }, [onError])

     // Handle pagination change - only fetch if needed
     const handlePageChange = useCallback((newPageZeroBased) => {
          const nextPage = Number(newPageZeroBased) + 1
          if (!Number.isFinite(nextPage)) return
          setPagination(prev => ({ ...prev, current: nextPage }))
          // Only fetch if we need more data than what's available locally
          if (nextPage > 1 || searchTerm) {
               fetchSalesReturns({ page: nextPage })
          }
     }, [fetchSalesReturns, searchTerm])

     // Handle page size change - fetch new data with new page size
     const handlePageSizeChange = useCallback((newSize) => {
          setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }))
          fetchSalesReturns({ limit: newSize, page: 1 })
     }, [fetchSalesReturns])

     // Handle sort change - for now just local sort, could be enhanced with API
     const handleSortChange = useCallback((column, direction) => {
          setSortBy(column)
          setSortDirection(direction)
          // For now, just update the sort state - could implement local sorting here
          // or fetch from API: fetchSalesReturns({ sortBy: column, sortDirection: direction })
     }, []) // Removed fetchSalesReturns dependency since we're not using it for now

     // Search handlers - works with initial data
     const handleSearchInputChange = useCallback(async (value) => {
          // Don't do anything if the value hasn't actually changed
          if (value === stateRef.current.searchTerm) return

          setSearching(true)
          setSearchTerm(value)

          try {
               // Simple local search implementation using initial data
               if (value.trim() === '') {
                    // Reset to initial data when search is cleared
                    setSalesReturns(initialSalesReturns || [])
                    setPagination(prev => ({
                         ...prev,
                         current: 1,
                         total: (initialSalesReturns || []).length
                    }))
               } else {
                    // Filter initial data locally
                    const filtered = (initialSalesReturns || []).filter(item =>
                         item.credit_note_id?.toLowerCase().includes(value.toLowerCase()) ||
                         item.customerInfo?.name?.toLowerCase().includes(value.toLowerCase()) ||
                         item.customerInfo?.phone?.includes(value)
                    )
                    setSalesReturns(filtered)
                    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }))
               }
          } catch (error) {
               console.error('Error searching sales returns:', error)
               onError(error.message || 'Search failed')
          } finally {
               setSearching(false)
          }
     }, [onError, initialSalesReturns])

     const handleSearchSubmit = useCallback(async (event) => {
          event.preventDefault()
          setSearching(true)

          try {
               await fetchSalesReturns({ search: searchTerm, page: 1 })
          } catch (error) {
               console.error('Error submitting search:', error)
               onError(error.message || 'Search failed')
          } finally {
               setSearching(false)
          }
     }, [searchTerm, fetchSalesReturns, onError])

     const handleSearchClear = useCallback(async () => {
          setSearchTerm('')
          setSearching(true)

          try {
               // Reset to initial data when clearing search
               setSalesReturns(initialSalesReturns || [])
               setPagination(prev => ({
                    ...prev,
                    current: 1,
                    total: (initialSalesReturns || []).length
               }))
          } catch (error) {
               console.error('Error clearing search:', error)
               onError(error.message || 'Failed to clear search')
          } finally {
               setSearching(false)
          }
     }, [onError, initialSalesReturns])

     const handleSearchFocus = useCallback(() => {
          // Additional focus logic if needed
     }, [])

     const handleSearchBlur = useCallback(() => {
          // Additional blur logic if needed
     }, [])

     return {
          // Data state
          salesReturns,
          pagination,
          sortBy,
          sortDirection,
          loading,

          // Search state
          searchTerm,
          searching,

          // Data setters
          setSalesReturns,
          setPagination,
          setSortBy,
          setSortDirection,
          setLoading,

          // Data actions
          fetchSalesReturns,
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
