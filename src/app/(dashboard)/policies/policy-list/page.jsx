import PolicyListIndex from '@/views/policies/listPolicy';
import { getWarrantyPolicies } from '../actions';

export const metadata = {
  title: 'Warranty Policies | Kanakku',
};

export default async function PolicyListPage() {
  const initialData = await getWarrantyPolicies({ page: 1, pageSize: 10 });

  return (
    <PolicyListIndex
      initialPolicies={initialData?.success ? initialData.data || [] : []}
      initialPagination={{
        current: 1,
        pageSize: 10,
        total: initialData?.success ? initialData.totalRecords || 0 : 0,
      }}
      initialSummary={initialData?.success ? initialData.summary || {} : {}}
      initialErrorMessage={initialData?.success ? '' : initialData?.message || 'Failed to load warranty policies'}
    />
  );
}
