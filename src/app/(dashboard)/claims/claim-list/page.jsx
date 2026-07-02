import ClaimListIndex from '@/views/claims/listClaim';
import { getWarrantyClaims } from '../actions';

export const metadata = {
  title: 'Warranty Claims | Kanakku',
};

export default async function ClaimListPage() {
  const initialData = await getWarrantyClaims({ page: 1, pageSize: 10 });

  return (
    <ClaimListIndex
      initialClaims={initialData?.success ? initialData.data || [] : []}
      initialPagination={{
        current: 1,
        pageSize: 10,
        total: initialData?.success ? initialData.totalRecords || 0 : 0,
      }}
      initialSummary={initialData?.success ? initialData.summary || {} : {}}
      initialErrorMessage={initialData?.success ? '' : initialData?.message || 'Failed to load warranty claims'}
    />
  );
}
