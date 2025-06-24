'use client'

import { useState } from 'react';

/**
 * Filter handler for inventory list
 */
export function filterHandler(initialFilters = {}) {
  const [filterValues, setFilterValues] = useState({
    product: [],
    ...initialFilters,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  const updateFilter = (field, value) =>
    setFilterValues(prev => ({ ...prev, [field]: value }));

  const resetFilters = () => setFilterValues({
    product: [],
  });

  const hasActiveFilters = () => {
    const { product } = filterValues;
    return !!(product?.length > 0);
  };

  const getActiveFilterCount = () => {
    const { product } = filterValues;
    return [
      product?.length > 0,
    ].filter(Boolean).length;
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