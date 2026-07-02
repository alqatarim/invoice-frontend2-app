import ViewWarrantyIndex from '@/views/warranties/viewWarranty';
import { getWarrantyById } from '../../actions';

export const metadata = {
  title: 'Warranty Detail | Kanakku',
};

export default async function WarrantyViewPage({ params }) {
  let warranty = null;
  let initialErrorMessage = '';

  try {
    warranty = await getWarrantyById(params?.id);
  } catch (error) {
    initialErrorMessage = error.message || 'Failed to load warranty';
  }

  return <ViewWarrantyIndex warranty={warranty} initialErrorMessage={initialErrorMessage} />;
}
