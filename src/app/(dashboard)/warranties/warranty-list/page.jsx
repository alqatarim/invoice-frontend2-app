import WarrantyListIndex from '@/views/warranties/listWarranty';
import { getWarranties } from '../actions';

export const metadata = {
  title: 'Warranties | Kanakku',
};

export default async function WarrantyListPage() {
  const initialData = await getWarranties({ page: 1, pageSize: 10 });

  return (
    <WarrantyListIndex
      initialRecords={initialData?.success ? initialData.data || [] : []}
      initialPagination={{
        current: 1,
        pageSize: 10,
        total: initialData?.success ? initialData.totalRecords || 0 : 0,
      }}
      initialSummary={initialData?.success ? initialData.summary || {} : {}}
      initialErrorMessage={initialData?.success ? '' : initialData?.message || 'Failed to load warranties'}
    />
  );
}
