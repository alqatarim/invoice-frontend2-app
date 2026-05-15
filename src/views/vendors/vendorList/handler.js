'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  addVendor,
  deleteVendor,
  getFilteredVendors,
  updateVendor,
} from '@/app/(dashboard)/vendors/actions'
import { formatDate } from '@/utils/dateUtils'

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 }

const formatVendorDate = value => (value ? formatDate(value) : 'N/A')

export function useVendorListHandler({
  initialVendors = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
  onInfo,
  onSuccess,
}) {
  const router = useRouter()

  const [vendors, setVendors] = useState(initialVendors)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortDirection, setSortDirection] = useState(initialSortDirection)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [dialogStates, setDialogStates] = useState({
    add: false,
    edit: false,
    view: false,
    ledger: false,
    editVendorId: null,
    viewVendorId: null,
    ledgerVendorId: null,
  })

  const loadingRef = useRef(false)
  const stateRef = useRef({
    pagination: initialPagination,
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
    searchTerm: '',
    filters: {},
  })

  useEffect(() => {
    stateRef.current = {
      pagination,
      sortBy,
      sortDirection,
      searchTerm,
      filters,
    }
  }, [pagination, sortBy, sortDirection, searchTerm, filters])

  const fetchVendors = useCallback(
    async (params = {}) => {
      if (loadingRef.current) return null

      loadingRef.current = true
      setLoading(true)

      try {
        const currentState = stateRef.current
        const page = params.page ?? currentState.pagination.current
        const pageSize = params.pageSize ?? currentState.pagination.pageSize
        const nextFilters = params.filters ?? currentState.filters
        const nextSortBy = params.sortBy ?? currentState.sortBy
        const nextSortDirection = params.sortDirection ?? currentState.sortDirection

        const result = await getFilteredVendors(
          page,
          pageSize,
          nextFilters,
          nextSortBy,
          nextSortDirection
        )

        setVendors(result?.vendors || [])
        setPagination(result?.pagination || DEFAULT_PAGINATION)
        setFilters(nextFilters)
        setSortBy(nextSortBy)
        setSortDirection(nextSortDirection)

        if (params.search !== undefined) {
          setSearchTerm(params.search)
        }

        return result
      } catch (error) {
        onError?.(error.message || 'Failed to fetch vendors')
        throw error
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [onError]
  )

  const refreshData = useCallback(() => {
    const currentState = stateRef.current

    return fetchVendors({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      filters: currentState.filters,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
    })
  }, [fetchVendors])

  const handlePageChange = useCallback(
    newPageZeroBased => {
      const nextPage = Number(newPageZeroBased) + 1

      if (!Number.isFinite(nextPage)) return

      setPagination(current => ({ ...current, current: nextPage }))
      fetchVendors({ page: nextPage })
    },
    [fetchVendors]
  )

  const handlePageSizeChange = useCallback(
    newPageSize => {
      const pageSize = Number(newPageSize)

      if (!Number.isFinite(pageSize) || pageSize <= 0) return

      setPagination(current => ({ ...current, current: 1, pageSize }))
      fetchVendors({ page: 1, pageSize })
    },
    [fetchVendors]
  )

  const handleSortRequest = useCallback(
    (columnKey, direction) => {
      const currentState = stateRef.current
      const nextDirection =
        direction ||
        (currentState.sortBy === columnKey && currentState.sortDirection === 'asc'
          ? 'desc'
          : 'asc')

      setSortBy(columnKey)
      setSortDirection(nextDirection)

      fetchVendors({
        page: 1,
        sortBy: columnKey,
        sortDirection: nextDirection,
      })
    },
    [fetchVendors]
  )

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) return

      const trimmed = String(value || '').trim()
      const nextFilters = { ...stateRef.current.filters }

      if (trimmed) {
        nextFilters.search_vendor = trimmed
      } else {
        delete nextFilters.search_vendor
      }

      setSearchTerm(value)

      try {
        await fetchVendors({
          page: 1,
          filters: nextFilters,
          search: value,
        })
      } catch (error) {
        onError?.(error.message || 'Search failed')
      }
    },
    [fetchVendors, onError]
  )

  const handleOpenAddDialog = useCallback(() => {
    setDialogStates(current => ({ ...current, add: true }))
  }, [])

  const handleCloseAddDialog = useCallback(() => {
    setDialogStates(current => ({ ...current, add: false }))
  }, [])

  const handleOpenEditDialog = useCallback(vendorId => {
    setDialogStates(current => ({ ...current, edit: true, editVendorId: vendorId }))
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(current => ({ ...current, edit: false, editVendorId: null }))
  }, [])

  const handleOpenViewDialog = useCallback(vendorId => {
    setDialogStates(current => ({
      ...current,
      view: true,
      viewVendorId: vendorId,
    }))
  }, [])

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(current => ({
      ...current,
      view: false,
      viewVendorId: null,
    }))
  }, [])

  const handleOpenLedgerDialog = useCallback(vendorId => {
    setDialogStates(current => ({
      ...current,
      ledger: true,
      ledgerVendorId: vendorId,
    }))
  }, [])

  const handleCloseLedgerDialog = useCallback(() => {
    setDialogStates(current => ({
      ...current,
      ledger: false,
      ledgerVendorId: null,
    }))
  }, [])

  const handleView = useCallback(
    vendorId => {
      if (!vendorId) return

      handleOpenViewDialog(vendorId)
    },
    [handleOpenViewDialog]
  )

  const handleEdit = useCallback(
    vendorId => {
      if (!vendorId) return

      handleOpenEditDialog(vendorId)
    },
    [handleOpenEditDialog]
  )

  const handleLedger = useCallback(
    vendorId => {
      if (!vendorId) return

      handleOpenLedgerDialog(vendorId)
    },
    [handleOpenLedgerDialog]
  )

  const handleDelete = useCallback(
    async vendorId => {
      if (!vendorId) return

      try {
        await deleteVendor(vendorId)
        onSuccess?.('Vendor deleted successfully!')
        await refreshData()
      } catch (error) {
        onError?.(error.message || 'Failed to delete vendor')
      }
    },
    [onError, onSuccess, refreshData]
  )

  const handleAddVendor = useCallback(
    async formData => {
      try {
        onInfo?.('Submitting vendor...')
        const response = await addVendor(formData)

        if (!response.success) {
          const errorMessage = response.error?.message || response.message || 'Failed to add vendor'
          onError?.(errorMessage)

          return { success: false, message: errorMessage }
        }

        onSuccess?.('Vendor added successfully!')
        await refreshData()

        return response
      } catch (error) {
        const errorMessage = error.message || 'An unexpected error occurred'
        onError?.(errorMessage)

        return { success: false, message: errorMessage }
      }
    },
    [onError, onInfo, onSuccess, refreshData]
  )

  const handleUpdateVendor = useCallback(
    async (vendorId, formData) => {
      try {
        onInfo?.('Updating vendor...')
        const response = await updateVendor(vendorId, formData)

        if (!response.success) {
          const errorMessage = response.error?.message || response.message || 'Failed to update vendor'
          onError?.(errorMessage)

          return { success: false, message: errorMessage }
        }

        onSuccess?.('Vendor updated successfully!')
        await refreshData()

        return response
      } catch (error) {
        const errorMessage = error.message || 'An unexpected error occurred'
        onError?.(errorMessage)

        return { success: false, message: errorMessage }
      }
    },
    [onError, onInfo, onSuccess, refreshData]
  )

  const vendorsWithIndex = useMemo(
    () =>
      vendors.map((vendor, index) => ({
        ...vendor,
        _index: index,
      })),
    [vendors]
  )

  return {
    vendors: vendorsWithIndex,
    pagination,
    loading,
    sortBy,
    sortDirection,
    searchTerm,
    dialogStates,
    formatVendorDate,
    refreshData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleView,
    handleEdit,
    handleLedger,
    handleDelete,
    handleAddVendor,
    handleUpdateVendor,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleOpenViewDialog,
    handleCloseViewDialog,
    handleOpenLedgerDialog,
    handleCloseLedgerDialog,
  }
}
