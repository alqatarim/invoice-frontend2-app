import React from 'react';
import BranchListIndex from '@/views/branches/branchList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialBranchData } from '@/app/(dashboard)/branches/actions';

export const metadata = {
  title: 'Branches | Kanakku',
};

const BranchesPage = async () => {
  try {
    const initialData = await getInitialBranchData();
    return (
      <ProtectedComponent>
        <BranchListIndex initialData={initialData} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('BranchesPage: Error fetching data:', error);
    return (
      <ProtectedComponent>
        <div className="text-red-600 p-8">
          Failed to load branch data: {error.message}
        </div>
      </ProtectedComponent>
    );
  }
};

export default BranchesPage;
