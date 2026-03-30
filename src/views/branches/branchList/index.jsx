import BranchList from './BranchList';

const BranchListIndex = ({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialProvincesCities = [],
  initialUsers = [],
}) => {
  return (
    <BranchList
      initialBranches={initialBranches}
      initialPagination={initialPagination}
      initialProvincesCities={initialProvincesCities}
      initialUsers={initialUsers}
    />
  );
};

export default BranchListIndex;
