'use client'

import { useState, useCallback } from 'react'

const initialColumns = [
  { key: "id", label: "#", visible: true },
  { key: "image", label: "Image", visible: true },
  { key: "name", label: "Item", visible: true },
  { key: "alertQuantity", label: "Alert Quantity", visible: true },
  { key: "sellingPrice", label: "Sales Price", visible: true },
  { key: "purchasePrice", label: "Purchase Price", visible: true },
  { key: "action", label: "Action", visible: true },
]

export const useProductColumnsHandler = () => {
  const [columns, setColumns] = useState(initialColumns)
  const [tempColumns, setTempColumns] = useState(initialColumns)
  const [isColumnsDrawerOpen, setIsColumnsDrawerOpen] = useState(false)

  const handleManageColumnsOpen = useCallback(() => {
    setIsColumnsDrawerOpen(!isColumnsDrawerOpen)
  }, [isColumnsDrawerOpen])

  const toggleColumnVisibility = useCallback((index) => {
    const newColumns = tempColumns.map((column, idx) => {
      if (idx === index) {
        return { ...column, visible: !column.visible }
      }
      return column
    })
    setTempColumns(newColumns)
  }, [tempColumns])

  const handleApplyColumns = useCallback(() => {
    setColumns(tempColumns)
    setIsColumnsDrawerOpen(false)
  }, [tempColumns])

  const handleCancelColumns = useCallback(() => {
    setTempColumns(columns)
    setIsColumnsDrawerOpen(false)
  }, [columns])

  const resetColumns = useCallback(() => {
    setColumns(initialColumns)
    setTempColumns(initialColumns)
  }, [])

  return {
    columns,
    tempColumns,
    isColumnsDrawerOpen,
    handleManageColumnsOpen,
    toggleColumnVisibility,
    handleApplyColumns,
    handleCancelColumns,
    resetColumns
  }
}