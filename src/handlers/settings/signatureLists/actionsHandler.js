'use client';

import {
  addSignature,
  updateSignature,
  deleteSignatures,
  setDefaultSignature,
  updateSignatureStatus,
} from '@/app/(dashboard)/settings/actions';

/**
 * Signature actions handler - manages all signature-related CRUD actions.
 */
export function actionsHandler({ onSuccess, onError, refetchData }) {
  /**
   * Execute an action with standard error handling.
   * Refetch data after successful actions to ensure fresh backend data.
   */
  const executeAction = async (actionFn, successMessage, shouldRefetch = true) => {
    try {
      const result = await actionFn();

      // Only proceed if backend confirms success
      if (result?.success) {
        // Show success message only after backend confirmation
        onSuccess?.(successMessage);

        // Refetch fresh data from backend after successful action
        if (shouldRefetch && refetchData) {
          await refetchData();
        }
      } else {
        // Backend returned error - show error message
        const errorMessage = result?.message || 'Action failed';
        onError?.(errorMessage);
      }

      return result;
    } catch (error) {
      // Network or unexpected error
      onError?.(error.message || 'Action failed');
      throw error;
    }
  };

  return {
    handleAdd: (formData) =>
      executeAction(
        () => addSignature(formData),
        'Signature added successfully!'
      ),

    handleUpdate: (id, formData) =>
      executeAction(
        () => updateSignature(id, formData),
        'Signature updated successfully!'
      ),

    handleDelete: (id) =>
      executeAction(
        () => deleteSignatures(id),
        'Signature deleted successfully!'
      ),

    handleSetDefault: (id) =>
      executeAction(
        () => setDefaultSignature(id),
        'Default signature updated successfully!'
      ),

    handleToggleStatus: (id, status) =>
      executeAction(
        () => updateSignatureStatus(id, status),
        'Signature status updated successfully!'
      ),
  };
}