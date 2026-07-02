import ViewPolicyIndex from '@/views/policies/viewPolicy';
import { getWarrantyPolicyById } from '../../actions';

export const metadata = {
  title: 'Policy Detail | Kanakku',
};

export default async function PolicyViewPage({ params }) {
  let policy = null;
  let initialErrorMessage = '';

  try {
    policy = await getWarrantyPolicyById(params?.id);
  } catch (error) {
    initialErrorMessage = error.message || 'Failed to load warranty policy';
  }

  return <ViewPolicyIndex policy={policy} initialErrorMessage={initialErrorMessage} />;
}
