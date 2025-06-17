'use client';

import { useState, useCallback, useMemo } from 'react';
import { searchCustomers } from '@/app/(dashboard)/deliveryChallans/actions';

/**
 * Search handler for delivery challan list
 * Handles customer search with autocomplete functionality
 * Matches old implementation: only shows options when user types
 */
export function searchHandler() {
  const [customerOptions, setCustomerOptions] = useState([]); // Start empty like old implementation
  const [deliveryChallanOptions, setDeliveryChallanOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Customer search with debouncing (handled in component)
  const handleCustomerSearch = useCallback(async (searchTerm) => {
    // If search term is empty or too short, clear options (like old implementation)
    if (!searchTerm || searchTerm.trim().length < 1) {
      setCustomerOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const customers = await searchCustomers(searchTerm.trim());
      if (customers && customers.length > 0) {
        const formattedOptions = customers.map(customer => ({
          value: customer._id,
          label: customer.name || customer.customer || 'Unknown Customer'
        }));
        setCustomerOptions(formattedOptions);
      } else {
        // No customers found - show empty array (like old implementation)
        setCustomerOptions([]);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Delivery challan search (placeholder for future implementation)
  const handleDeliveryChallanSearch = useCallback(async (searchTerm) => {
    // TODO: Implement delivery challan search when backend supports it
    console.log('Delivery challan search not implemented:', searchTerm);
  }, []);

  // Clear customer options (used when resetting)
  const clearCustomerOptions = useCallback(() => {
    setCustomerOptions([]);
  }, []);

  // Memoized return object to prevent recreating on every render
  return useMemo(() => ({
    // State
    customerOptions,
    deliveryChallanOptions,
    searchLoading,

    // Setters (for backward compatibility)
    setCustomerOptions,
    setDeliveryChallanOptions,

    // Handlers
    handleCustomerSearch,
    handleDeliveryChallanSearch,
    clearCustomerOptions,
  }), [
    customerOptions,
    deliveryChallanOptions,
    searchLoading,
    handleCustomerSearch,
    handleDeliveryChallanSearch,
    clearCustomerOptions
  ]);
}