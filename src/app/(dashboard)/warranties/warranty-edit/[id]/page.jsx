import { notFound } from 'next/navigation';
import EditWarrantyIndex from '@/views/warranties/editWarranty';
import { getWarrantyById } from '../../actions';

export const metadata = {
  title: 'Edit Warranty | Kanakku',
};

export default async function WarrantyEditPage({ params }) {
  let warranty = null;
  let initialErrorMessage = '';

  try {
    warranty = await getWarrantyById(params?.id);

    if (!warranty) {
      notFound();
    }
  } catch (error) {
    initialErrorMessage = error.message || 'Failed to load warranty';
  }

  return <EditWarrantyIndex warranty={warranty} initialErrorMessage={initialErrorMessage} />;
}
