'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ViewUnitDialog from './ViewUnit';
import { getUnitById } from '@/app/(dashboard)/units/actions';

const ViewUnitIndex = ({
  open,
  unitId,
  onClose,
  initialUnitData = null,
}) => {
  const [unitData, setUnitData] = useState(initialUnitData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUnitData = useCallback(async () => {
    if (!open || !unitId) return;

    if (initialUnitData && initialUnitData._id === unitId) {
      setUnitData(initialUnitData);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUnitById(unitId);
      const unitDetails = response?.unit_type_details || response;

      if (!unitDetails || typeof unitDetails !== 'object') {
        throw new Error('Invalid unit data received');
      }

      setUnitData(unitDetails);
    } catch (fetchError) {
      console.error('Failed to fetch unit data:', fetchError);
      setError(fetchError.message || 'Failed to load unit data');
      setUnitData(null);
    } finally {
      setLoading(false);
    }
  }, [initialUnitData, open, unitId]);

  useEffect(() => {
    void loadUnitData();
  }, [loadUnitData]);

  if (!open) return null;

  return (
    <ViewUnitDialog
      open={open}
      unitData={unitData}
      loading={loading}
      error={error}
      onClose={onClose}
      onRetry={loadUnitData}
    />
  );
};

export default ViewUnitIndex;
