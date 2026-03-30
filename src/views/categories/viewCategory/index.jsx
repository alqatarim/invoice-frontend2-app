'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ViewCategory from './ViewCategory'
import { useCategoryHandler } from '@/views/categories/handler'
import { getCategoryById } from '@/app/(dashboard)/categories/actions'

const ViewCategoryIndex = ({ open, categoryId, onClose, onEdit }) => {
  const [categoryData, setCategoryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadCategoryData = useCallback(async () => {
    if (!open || !categoryId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getCategoryById(categoryId)
      const categoryDetails = response?.category_details || response

      if (!categoryDetails || typeof categoryDetails !== 'object') {
        throw new Error('Invalid category data received')
      }

      setCategoryData(categoryDetails)
    } catch (fetchError) {
      console.error('Failed to fetch category data:', fetchError)
      setError(fetchError.message || 'Failed to load category data')
      setCategoryData(null)
    } finally {
      setLoading(false)
    }
  }, [categoryId, open])

  useEffect(() => {
    void loadCategoryData()
  }, [loadCategoryData])

  const controller = useCategoryHandler({
    mode: 'view',
    open,
    categoryId,
    onClose,
    initialCategoryData: categoryData,
    initialLoading: loading,
    initialError: error,
    onRetry: loadCategoryData
  })

  if (!open) {
    return null
  }

  return <ViewCategory controller={controller} onEdit={onEdit} />
}

export default ViewCategoryIndex
