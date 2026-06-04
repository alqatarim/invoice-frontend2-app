'use client';

import React, { useCallback } from 'react';
import AddUser from './AddUser';
import { useUserHandler } from '@/views/users/handler';

const AddUserIndex = ({ open, onClose, onSave, roles = [], branches = [], loading = false }) => {
  const handleSave = useCallback(
    async ({ userData, preparedImage }) => {
      const result = await onSave(null, userData, preparedImage);
      return typeof result === 'boolean' ? { success: result } : result;
    },
    [onSave]
  );

  const controller = useUserHandler({
    mode: 'add',
    open,
    onClose,
    onSave: handleSave,
    initialRoles: roles,
    initialBranches: branches,
    initialSubmitting: loading,
  });

  const hasBootstrapData = Array.isArray(roles) && Array.isArray(branches);

  if (!open || !hasBootstrapData) {
    return null;
  }

  return <AddUser controller={controller} />;
};

export default AddUserIndex;
