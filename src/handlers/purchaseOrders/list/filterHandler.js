'use client';

import { useState } from 'react';

/**
 * Filter handler for purchase order list
 */
export function filterHandler(initialFilters = {}, initialTab = 'ALL') {
  const [filterValues, setFilterValues] = useState({
    vendor: [],
    purchaseOrderId: [],
    fromDate: '',
    toDate: '',
    ...initialFilters,
    status: initialFilters.status || (initialTab === 'ALL' ? [] : [initialTab]),
  });

  const [filterOpen, setFilterOpen] = useState(false);

  const updateFilter = (field, value) => 
    setFilterValues(prev => ({ ...prev, [field]: value }));

  const updateStatus = newStatuses => {
    let updatedStatuses = Array.isArray(newStatuses) ? [...newStatuses] : [];
    const hadAll = filterValues.status?.includes('ALL');
    const hasAll = updatedStatuses.includes('ALL');

    if (hasAll && !hadAll) {
      updatedStatuses = []; // 'ALL' was just selected - clear all
    } else if (hasAll) {
      updatedStatuses = updatedStatuses.filter(s => s !== 'ALL'); // Remove 'ALL' if others selected
    }

    updateFilter('status', updatedStatuses);
    return updatedStatuses;
  };

  const resetFilters = () => setFilterValues({
    vendor: [],
    purchaseOrderId: [],
    fromDate: '',
    toDate: '',
    status: []
  });

  const hasActiveFilters = () => {
    const { vendor, purchaseOrderId, fromDate, toDate, status } = filterValues;
    return !!(
      vendor?.length > 0 ||
      purchaseOrderId?.length > 0 ||
      fromDate ||
      toDate ||
      (status?.length > 0 && !status.includes('ALL'))
    );
  };

  const getActiveFilterCount = () => {
    const { vendor, purchaseOrderId, fromDate, toDate, status } = filterValues;
    return [
      vendor?.length > 0,
      purchaseOrderId?.length > 0,
      fromDate,
      toDate,
      status?.length > 0 && !status.includes('ALL')
    ].filter(Boolean).length;
  };

  return {
    filterValues,
    setFilterValues,
    filterOpen,
    setFilterOpen,
    updateFilter,
    updateStatus,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
    toggleFilter: () => setFilterOpen(!filterOpen),
  };
}