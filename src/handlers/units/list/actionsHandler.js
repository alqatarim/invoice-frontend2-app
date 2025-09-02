'use client';

import { useRouter } from 'next/navigation';
import { deleteUnit } from '@/app/(dashboard)/units/actions';

/**
 * Unit actions handler - manages all unit-related actions
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
        () => deleteUnit(id),
        'Unit deleted successfully!',
        true
      ),

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/units/unit-edit/${id}`);
      }
    },
  };
}
