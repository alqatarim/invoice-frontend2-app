'use client'

import { useState } from 'react';

/**
 * Filter handler for payment list - matches payment summary functionality
 */
export function filterHandler(initialFilters = {}) {
  const [filterValues, setFilterValues] = useState({
    customer: initialFilters.customer || [], // Array of selected customer IDs
    search_customer: initialFilters.search_customer || '', // Search term for customers
    status: initialFilters.status || '',
    payment_method: initialFilters.payment_method || '',
    ...initialFilters,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  // Update filter function
  const updateFilter = (field, value) => {
    setFilterValues(prev => {
      const newValues = { ...prev, [field]: value };

      // Special handling for customer field
      if (field === 'customer') {
        // Ensure customer is always an array
        newValues.customer = Array.isArray(value) ? value : [];
      }

      // Clear customer selection when search changes
      if (field === 'search_customer' && value === '') {
        newValues.customer = [];
      }

      return newValues;
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilterValues({
      customer: [],
      search_customer: '',
      status: '',
      payment_method: '',
    });
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    const { customer, search_customer, status, payment_method } = filterValues;
    return !!(
      (customer && customer.length > 0) ||
      search_customer ||
      status ||
      payment_method
    );
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    const { customer, search_customer, status, payment_method } = filterValues;
    return [
      customer && customer.length > 0,
      search_customer,
      status,
      payment_method
    ].filter(Boolean).length;
  };

  // Check if apply button should be enabled
  const canApplyFilters = () => {
    return filterValues.customer && filterValues.customer.length > 0;
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
    canApplyFilters,
    toggleFilter: () => setFilterOpen(!filterOpen),
  };
}