'use client'

import React, { useCallback, useEffect, useState } from 'react'
import EditCategory from './EditCategory'
import { useCategoryHandler } from '@/views/categories/handler'
import { getCategoryById, getCategoryDropdownData } from '@/app/(dashboard)/categories/actions'

const EditCategoryIndex = ({ open, categoryId, onClose, onSave }) => {
  const [categoryData, setCategoryData] = useState(null)
  const [dropdownOptions, setDropdownOptions] = useState({ categories: [], taxes: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [optionsLoading, setOptionsLoading] = useState(false)

  const handleSave = useCallback(
    ({ categoryId: nextCategoryId, formData, preparedImage }) =>
      onSave(nextCategoryId, formData, preparedImage),
    [onSave]
  )

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
    const loadDropdowns = async () => {
      if (!open) {
        return
      }

      setOptionsLoading(true)

      try {
        const response = await getCategoryDropdownData()

        if (response?.success) {
          setDropdownOptions({
            categories: response.data?.categories || [],
            taxes: response.data?.taxes || []
          })
        }
      } catch (fetchError) {
        console.error('Failed to load category dropdown data', fetchError)
      } finally {
        setOptionsLoading(false)
      }
    }

    void loadDropdowns()
  }, [open])

  useEffect(() => {
    void loadCategoryData()
  }, [loadCategoryData])

  const controller = useCategoryHandler({
    mode: 'edit',
    open,
    categoryId,
    onClose,
    onSave: handleSave,
    initialCategoryData: categoryData,
    initialDropdownOptions: dropdownOptions,
    initialLoading: loading,
    initialError: error,
    initialOptionsLoading: optionsLoading,
    onRetry: loadCategoryData
  })

  if (!open) {
    return null
  }

  return <EditCategory controller={controller} />
}

export default EditCategoryIndex
