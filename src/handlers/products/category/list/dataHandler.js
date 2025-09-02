'use client'

import { useState, useCallback } from 'react'
import { getCategoryList } from '@/app/(dashboard)/products/actions'
import { toast } from 'react-toastify'

export const useCategoryDataHandler = () => {
  const [categoryList, setCategoryList] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [sortBy, setSortBy] = useState('category_name')
  const [sortDirection, setSortDirection] = useState('asc')

  const fetchCategoryList = useCallback(async (pageNum = page, pageSize = size) => {
    setLoading(true)
    try {
      const response = await getCategoryList(pageNum, pageSize)
      if (response.success) {
        setCategoryList(response.data || [])
        setTotalCount(response.totalCount || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(error.message || 'Error fetching categories')
      setCategoryList([])
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
    if (!categoryList || categoryList.length === 0) return

    let newDirection = 'asc'
    if (sortBy === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    setSortBy(columnKey)
    setSortDirection(newDirection)

    const sortedList = [...categoryList].sort((a, b) => {
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

    setCategoryList(sortedList)
  }, [categoryList, sortBy, sortDirection])

  return {
    categoryList,
    setCategoryList,
    totalCount,
    setTotalCount,
    loading,
    page,
    setPage,
    size,
    setSize,
    sortBy,
    sortDirection,
    fetchCategoryList,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest
  }
}