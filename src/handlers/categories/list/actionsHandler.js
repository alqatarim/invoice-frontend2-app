'use client';

import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/app/(dashboard)/categories/actions';

/**
 * Category actions handler - manages all category-related actions
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters, onEdit }) {
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
        () => deleteCategory(id),
        'Category deleted successfully!',
        true
      ),

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/categories/category-edit/${id}`);
      }
    },
  };
}
