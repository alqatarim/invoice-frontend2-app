'use client';

import { useState } from 'react';

/**
 * Filter handler for payment summary list (following invoice pattern)
 */
export function filterHandler(initialFilters = {}) {
  const [filterValues, setFilterValues] = useState({
    customer: [],
    ...initialFilters,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  const updateFilter = (field, value) =>
    setFilterValues(prev => ({ ...prev, [field]: value }));

  const resetFilters = () => setFilterValues({
    customer: [],
  });

  const hasActiveFilters = () => {
    const { customer } = filterValues;
    return !!(customer?.length > 0);
  };

  const getActiveFilterCount = () => {
    const { customer } = filterValues;
    return [customer?.length > 0].filter(Boolean).length;
  };

  return {
    filterValues,
    setFilterValues,
    filterOpen,
    setFilterOpen,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
    toggleFilter: () => setFilterOpen(!filterOpen),
  };
}