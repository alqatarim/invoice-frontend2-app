'use client'

import { useState, useCallback } from 'react'
import { getUnitList } from '@/app/(dashboard)/products/actions'
import { toast } from 'react-toastify'

export const useUnitDataHandler = () => {
  const [unitList, setUnitList] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [sortBy, setSortBy] = useState('unit')
  const [sortDirection, setSortDirection] = useState('asc')

  const fetchUnitList = useCallback(async (pageNum = page, pageSize = size) => {
    setLoading(true)
    try {
      const response = await getUnitList(pageNum, pageSize)
      if (response.success) {
        setUnitList(response.data || [])
        setTotalCount(response.totalCount || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch units')
      }
    } catch (error) {
      console.error('Error fetching units:', error)
      toast.error(error.message || 'Error fetching units')
      setUnitList([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, size])

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1)
  }, [])

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10)
    setSize(newSize)
    setPage(1)
  }, [])

  const handleSortRequest = useCallback((columnKey) => {
    if (!unitList || unitList.length === 0) return

    let newDirection = 'asc'
    if (sortBy === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    setSortBy(columnKey)
    setSortDirection(newDirection)

    const sortedList = [...unitList].sort((a, b) => {
      let aValue = a?.[columnKey] ?? ''
      let bValue = b?.[columnKey] ?? ''

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setUnitList(sortedList)
  }, [unitList, sortBy, sortDirection])

  return {
    unitList,
    setUnitList,
    totalCount,
    setTotalCount,
    loading,
    page,
    setPage,
    size,
    setSize,
    sortBy,
    sortDirection,
    fetchUnitList,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest
  }
}