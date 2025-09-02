'use client';

import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/(dashboard)/products/actions';

/**
 * Product actions handler - manages all product-related actions
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters, onView, onEdit }) {
  const router = useRouter();

  /**
   * Execute an action with standard error handling and optional data refresh
   */
  const executeAction = async (actionFn, successMessage, shouldRefresh = false) => {
    try {
      const result = await actionFn();
      onSuccess?.(successMessage);
      if (shouldRefresh && fetchData) {
        await fetchData({ page: pagination?.current, filters });
      }
      return result;
    } catch (error) {
      onError?.(error.message || 'Action failed');
      throw error;
    }
  };

  return {
    handleDelete: (id) =>
      executeAction(
        () => deleteProduct(id),
        'Product deleted successfully!',
        true
      ),

    handleView: (id) => {
      if (onView) {
        onView(id);
      } else {
        router.push(`/products/product-view/${id}`);
      }
    },

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/products/product-edit/${id}`);
      }
    },
  };
}