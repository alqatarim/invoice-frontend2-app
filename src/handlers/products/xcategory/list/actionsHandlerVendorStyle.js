'use client'

import { useCallback } from 'react';
import { deleteCategory } from '@/app/(dashboard)/products/actions';

/**
 * Category actions handler aligned with vendor actions pattern
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

  const handleDelete = useCallback(async (categoryId) => {
    try {
      onSuccess?.('Deleting category...');
      
      const response = await deleteCategory(categoryId);
      
      if (response.success) {
        onSuccess?.('Category deleted successfully');
        // Refresh the list after deletion - use current state
        await fetchData(); // Let fetchData use current state from stateRef
      } else {
        throw new Error(response.error || 'Failed to delete category');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to delete category');
    }
  }, [onSuccess, onError, fetchData]); // Remove pagination and filters

  const handleView = useCallback((categoryId) => {
    if (onView) {
      onView(categoryId);
    } else {
      // Default navigation behavior - categories don't have view pages
      window.location.href = `/products/category-edit/${categoryId}`;
    }
  }, [onView]);

  const handleEdit = useCallback((categoryId) => {
    if (onEdit) {
      onEdit(categoryId);
    } else {
      // Default navigation behavior  
      window.location.href = `/products/category-edit/${categoryId}`;
    }
  }, [onEdit]);

  return {
    handleDelete,
    handleView,
    handleEdit,
  };
}