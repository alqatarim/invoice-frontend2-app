import { useState, useCallback } from 'react'

/**
 * Columns handler for managing sales return list table columns
 */
export const useColumnsHandler = ({ initialColumns }) => {
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false)
  const [tempColumns, setTempColumns] = useState(initialColumns || [])

  // Handle manage columns dialog open
  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true)
  }, [])

  // Handle manage columns dialog close
  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false)
    setTempColumns(initialColumns || [])
  }, [initialColumns])

  // Handle column toggle
  const handleColumnToggle = useCallback((columnId) => {
    setTempColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, visible: !col.visible }
          : col
      )
    )
  }, [])

  // Handle manage columns save
  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(tempColumns)
    setManageColumnsOpen(false)

    // Save to localStorage for persistence
    try {
      localStorage.setItem('salesReturnListColumns', JSON.stringify(tempColumns))
    } catch (error) {
      console.warn('Failed to save column preferences:', error)
    }
  }, [tempColumns])

  // Reset columns to default
  const handleResetColumns = useCallback(() => {
    setTempColumns(initialColumns || [])
  }, [initialColumns])

  // Load saved column preferences
  const loadSavedColumns = useCallback(() => {
    try {
      const saved = localStorage.getItem('salesReturnListColumns')
      if (saved) {
        const savedColumns = JSON.parse(saved)
        setTempColumns(savedColumns)
        return savedColumns
      }
    } catch (error) {
      console.warn('Failed to load saved column preferences:', error)
    }
    return initialColumns || []
  }, [initialColumns])

  // Get visible columns
  const getVisibleColumns = useCallback((columns) => {
    return columns.filter(col => col.visible !== false)
  }, [])

  return {
    // State
    manageColumnsOpen,
    tempColumns,

    // Actions
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnToggle,
    handleManageColumnsSave,
    handleResetColumns,
    loadSavedColumns,
    getVisibleColumns,
    setTempColumns
  }
}