import React from 'react';
import UnitListIndex from '@/views/units/unitList/index';
import { getInitialUnitData } from '@/app/(dashboard)/units/actions';

export const metadata = {
  title: 'Units | Kanakku',
};

/**
 * UnitsPage Component - Optimized to prevent race conditions
 */
const UnitsPage = async () => {
  let initialUnits = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialErrorMessage = '';

  try {
    const initialData = await getInitialUnitData();
    initialUnits = initialData?.units || [];
    initialPagination = initialData?.pagination || initialPagination;
  } catch (error) {
    console.error('UnitsPage: Error fetching data:', error);
    initialErrorMessage = error?.message || 'Failed to load unit data.';
  }

  return (
    <UnitListIndex
      initialUnits={initialUnits}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default UnitsPage;
