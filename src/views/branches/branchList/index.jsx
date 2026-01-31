import BranchList from './BranchList';

const BranchListIndex = ({ initialData }) => {
  const initialBranches = initialData?.branches || [];
  const initialPagination = initialData?.pagination || { current: 1, pageSize: 10, total: 0 };

  return (
    <BranchList
      initialBranches={initialBranches}
      initialPagination={initialPagination}
    />
  );
};

export default BranchListIndex;
