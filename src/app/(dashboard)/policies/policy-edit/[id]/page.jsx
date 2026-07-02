import { notFound } from 'next/navigation';
import EditPolicyIndex from '@/views/policies/editPolicy';
import { getWarrantyPolicyById } from '../../actions';

export const metadata = {
  title: 'Edit Policy | Kanakku',
};

export default async function PolicyEditPage({ params }) {
  let policy = null;
  let initialErrorMessage = '';

  try {
    policy = await getWarrantyPolicyById(params?.id);

    if (!policy) {
      notFound();
    }
  } catch (error) {
    initialErrorMessage = error.message || 'Failed to load warranty policy';
  }

  return <EditPolicyIndex policy={policy} initialErrorMessage={initialErrorMessage} />;
}
