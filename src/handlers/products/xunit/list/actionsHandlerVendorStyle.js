'use client'

import { useCallback } from 'react';
import { deleteUnit } from '@/app/(dashboard)/products/actions';

/**
 * Unit actions handler aligned with vendor actions pattern
 */
export function actionsHandler({
  onSuccess,
  onError,
  fetchData,
  pagination,
  filters,
  onView,
  onEdit,
}) {

  const handleDelete = useCallback(async (unitId) => {
    try {
      onSuccess?.('Deleting unit...');
      
      const response = await deleteUnit(unitId);
      
      if (response.success) {
        onSuccess?.('Unit deleted successfully');
        // Refresh the list after deletion - use current state
        await fetchData(); // Let fetchData use current state from stateRef
      } else {
        throw new Error(response.error || 'Failed to delete unit');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to delete unit');
    }
  }, [onSuccess, onError, fetchData]); // Remove pagination and filters

  const handleView = useCallback((unitId) => {
    if (onView) {
      onView(unitId);
    } else {
      // Default navigation behavior - units don't have view pages
      window.location.href = `/products/unit-edit/${unitId}`;
    }
  }, [onView]);

  const handleEdit = useCallback((unitId) => {
    if (onEdit) {
      onEdit(unitId);
    } else {
      // Default navigation behavior  
      window.location.href = `/products/unit-edit/${unitId}`;
    }
  }, [onEdit]);

  return {
    handleDelete,
    handleView,
    handleEdit,
  };
}