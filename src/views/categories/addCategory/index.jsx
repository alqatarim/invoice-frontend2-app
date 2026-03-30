'use client'

import React, { useCallback, useEffect, useState } from 'react'
import AddCategory from './AddCategory'
import { useCategoryHandler } from '@/views/categories/handler'
import { getCategoryDropdownData } from '@/app/(dashboard)/categories/actions'

const AddCategoryIndex = ({ open, onClose, onSave }) => {
  const [dropdownOptions, setDropdownOptions] = useState({ categories: [], taxes: [] })
  const [optionsLoading, setOptionsLoading] = useState(false)

  const handleSave = useCallback(
    ({ formData, preparedImage }) => onSave(formData, preparedImage),
    [onSave]
  )

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
      } catch (error) {
        console.error('Failed to load category dropdown data', error)
      } finally {
        setOptionsLoading(false)
      }
    }

    void loadDropdowns()
  }, [open])

  const controller = useCategoryHandler({
    mode: 'add',
    open,
    onClose,
    onSave: handleSave,
    initialDropdownOptions: dropdownOptions,
    initialOptionsLoading: optionsLoading
  })

  if (!open) {
    return null
  }

  return <AddCategory controller={controller} />
}

export default AddCategoryIndex
