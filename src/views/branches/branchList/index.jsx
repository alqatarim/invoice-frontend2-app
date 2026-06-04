'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import BranchList from './BranchList';

const BranchListIndex = ({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialProvincesCities = [],
  initialUsers = [],
  initialFilters = {},
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <BranchList
        initialBranches={initialBranches}
        initialPagination={initialPagination}
        initialSummary={initialSummary}
        initialProvincesCities={initialProvincesCities}
        initialUsers={initialUsers}
        initialFilters={initialFilters}
      />
    </AppSnackbarProvider>
  );
};

export default BranchListIndex;
