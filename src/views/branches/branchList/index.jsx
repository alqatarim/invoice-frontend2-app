import BranchList from './BranchList';

const BranchListIndex = ({ initialData, initialProvincesCities = [] }) => {
  const initialBranches = initialData?.branches || [];
  const initialPagination = initialData?.pagination || { current: 1, pageSize: 10, total: 0 };

  return (
    <BranchList
      initialBranches={initialBranches}
      initialPagination={initialPagination}
      initialProvincesCities={initialProvincesCities}
    />
  );
};

export default BranchListIndex;
