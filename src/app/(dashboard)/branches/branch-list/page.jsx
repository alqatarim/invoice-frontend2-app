import React from 'react';
import BranchListIndex from '@/views/branches/branchList/index';
import { getInitialBranchData, getProvincesCities } from '@/app/(dashboard)/branches/actions';

export const metadata = {
  title: 'Branches | Kanakku',
};

const BranchesPage = async () => {
  try {
    const [initialData, provincesCities] = await Promise.all([
      getInitialBranchData(),
      getProvincesCities()
    ]);
    return (
      <BranchListIndex initialData={initialData} initialProvincesCities={provincesCities} />
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
