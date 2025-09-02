import React from 'react';
import UnitListIndex from '@/views/units/unitList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialUnitData } from '@/app/(dashboard)/units/actions';

export const metadata = {
  title: 'Units | Kanakku',
};

/**
 * UnitsPage Component - Optimized to prevent race conditions
 */
const UnitsPage = async () => {
  try {
    // Single server-side data fetch
    const initialData = await getInitialUnitData();

    return (
      <ProtectedComponent>
        <UnitListIndex initialData={initialData} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('UnitsPage: Error fetching data:', error);
    return (
      <ProtectedComponent>
        <div className="text-red-600 p-8">
          Failed to load unit data: {error.message}
        </div>
      </ProtectedComponent>
    );
  }
};

export default UnitsPage;
