import React from 'react';
import BranchListIndex from '@/views/branches/branchList/index';
import { getInitialBranchData, getProvincesCities } from '@/app/(dashboard)/branches/actions';

export const metadata = {
  title: 'Branches | Kanakku',
};

const BranchesPage = async () => {
  try {
    const [initialDataResult, provincesCitiesResult] = await Promise.allSettled([
      getInitialBranchData(),
      getProvincesCities()
    ]);

    if (initialDataResult.status !== 'fulfilled') {
      throw initialDataResult.reason;
    }

    const provincesCities = provincesCitiesResult.status === 'fulfilled' ? provincesCitiesResult.value : [];
    return (
      <BranchListIndex initialData={initialDataResult.value} initialProvincesCities={provincesCities} />
    );
  } catch (error) {
    console.error('BranchesPage: Error fetching data:', error);
    return (
      <div className="text-red-600 p-8">
        Failed to load branch data: {error.message}
      </div>
    );
  }
};

export default BranchesPage;
