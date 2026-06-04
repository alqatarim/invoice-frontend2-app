'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import ViewUser from './ViewUser';
import { useUserHandler } from '@/views/users/handler';
import { getUserById } from '@/app/(dashboard)/users/actions';

const ViewUserIndex = ({ open, onClose, userId, roles = [], branches = [] }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!open || !userId) {
      setUserData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserById(userId);
      setUserData(result);
    } catch (fetchError) {
      console.error('Failed to fetch user data:', fetchError);
      setError(fetchError.message || 'Failed to load user data');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [open, userId]);

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  const controller = useUserHandler({
    mode: 'view',
    open,
    userId,
    onClose,
    initialUserData: userData,
    initialRoles: roles,
    initialBranches: branches,
    initialLoading: loading,
    initialError: error,
    onRetry: loadUserData,
  });

  const hasBootstrapData = Array.isArray(roles) && Array.isArray(branches);
  const canRenderDialog = hasBootstrapData && !loading && Boolean(controller.userData || error);

  if (!open) {
    return null;
  }

  if (!canRenderDialog) {
    return (
      <Backdrop open sx={{ zIndex: theme => theme.zIndex.modal - 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return <ViewUser controller={controller} />;
};

export default ViewUserIndex;
