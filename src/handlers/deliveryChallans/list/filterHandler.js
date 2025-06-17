'use client';

import { useState, useCallback, useMemo } from 'react';
import { deliveryChallanTabs } from '@/data/dataSets';

/**
 * Filter handler for delivery challans list
 */
export const useFilterHandler = () => {
  // Filter state
  const [filters, setFilters] = useState({
    customer: [],
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('ALL');

  // Filter change handlers
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Filter application
  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      customer: [],
    });
  }, []);

  // Tab handlers
  const handleTabChange = useCallback((event, newTab) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  }, []);

  // Memoized return object to prevent recreating on every render
  return useMemo(() => ({
    filters,
    activeTab,
    availableTabs: deliveryChallanTabs,
    handleFilterChange,
    handleTabChange,
    applyFilters,
    resetFilters,
  }), [
    filters,
    activeTab,
    handleFilterChange,
    handleTabChange,
    applyFilters,
    resetFilters
  ]);
};