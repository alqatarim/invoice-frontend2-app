'use client'

import { useCallback } from 'react';
import { deleteProduct } from '@/app/(dashboard)/products/actions';

/**
 * Product actions handler aligned with vendor actions pattern
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

  const handleDelete = useCallback(async (productId) => {
    try {
      onSuccess?.('Deleting product...');
      
      const response = await deleteProduct(productId);
      
      if (response.success) {
        onSuccess?.('Product deleted successfully');
        // Refresh the list after deletion - use current state
        await fetchData(); // Let fetchData use current state from stateRef
      } else {
        throw new Error(response.error || 'Failed to delete product');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to delete product');
    }
  }, [onSuccess, onError, fetchData]); // Remove pagination and filters

  const handleView = useCallback((productId) => {
    if (onView) {
      onView(productId);
    } else {
      // Default navigation behavior
      window.location.href = `/products/product-view/${productId}`;
    }
  }, [onView]);

  const handleEdit = useCallback((productId) => {
    if (onEdit) {
      onEdit(productId);
    } else {
      // Default navigation behavior  
      window.location.href = `/products/product-edit/${productId}`;
    }
  }, [onEdit]);

  return {
    handleDelete,
    handleView,
    handleEdit,
  };
}