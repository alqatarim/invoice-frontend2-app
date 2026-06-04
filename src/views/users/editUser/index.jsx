'use client';

import React, { useCallback } from 'react';
import EditUser from './EditUser';
import { useUserHandler } from '@/views/users/handler';

const EditUserIndex = ({ open, onClose, onSave, userId, initialUserData, roles = [], branches = [], loading = false }) => {
  const handleSave = useCallback(
    async ({ userId: nextUserId, userData, preparedImage }) => {
      const result = await onSave(nextUserId, userData, preparedImage);
      return typeof result === 'boolean' ? { success: result } : result;
    },
    [onSave]
  );

  const controller = useUserHandler({
    mode: 'edit',
    open,
    userId,
    onClose,
    onSave: handleSave,
    initialUserData,
    initialRoles: roles,
    initialBranches: branches,
    initialSubmitting: loading,
  });

  const hasBootstrapData = Array.isArray(roles) && Array.isArray(branches);
  const canRenderDialog = hasBootstrapData && Boolean(initialUserData) && Boolean(controller.userData);

  if (!open || !canRenderDialog) {
    return null;
  }

  return <EditUser controller={controller} />;
};

export default EditUserIndex;
