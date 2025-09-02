'use client';

import { useRouter } from 'next/navigation';
import { deleteVendor } from '@/app/(dashboard)/vendors/actions';

/**
 * Vendor actions handler - manages all vendor-related actions
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters, onView, onEdit, onLedger }) {
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
        () => deleteVendor(id),
        'Vendor deleted successfully!',
        true
      ),

    handleView: (id) => {
      if (onView) {
        onView(id);
      } else {
        router.push(`/vendors/vendor-view/${id}`);
      }
    },

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/vendors/edit/${id}`);
      }
    },

    handleLedger: (id) => {
      if (onLedger) {
        onLedger(id);
      } else {
        router.push(`/vendors/vendor-view/${id}`);
      }
    },
  };
}