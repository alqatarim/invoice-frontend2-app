'use client'

import { useState, useCallback } from 'react'

export const useCategoryFilterHandler = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [tab, setTab] = useState('CATEGORY')

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(!isDrawerOpen)
  }, [isDrawerOpen])

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleTabChange = useCallback((e, value) => {
    setTab(value)
  }, [])

  return {
    isDrawerOpen,
    tab,
    toggleDrawer,
    handleDrawerClose,
    handleTabChange
  }
}