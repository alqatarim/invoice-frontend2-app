'use client';

import { useRouter } from 'next/navigation';
import { deleteBranch } from '@/app/(dashboard)/branches/actions';

export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters, onEdit, onView }) {
  const router = useRouter();

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
        () => deleteBranch(id),
        'Branch deleted successfully!',
        true
      ),

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/branches/branch-edit/${id}`);
      }
    },

    handleView: (id) => {
      if (onView) {
        onView(id);
      } else {
        router.push(`/branches/branch-view/${id}`);
      }
    },
  };
}
