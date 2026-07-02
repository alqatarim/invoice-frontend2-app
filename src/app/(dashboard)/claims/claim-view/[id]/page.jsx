import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import ViewClaim from '@/views/claims/viewClaim/ViewClaim';
import { getWarrantyClaimById } from '../../actions';

export const metadata = {
  title: 'Warranty Claim Detail | Kanakku',
};

export default async function WarrantyClaimViewPage({ params }) {
  let claim = null;
  let initialErrorMessage = '';

  try {
    claim = await getWarrantyClaimById(params?.id);
  } catch (error) {
    initialErrorMessage = error.message || 'Failed to load warranty claim';
  }

  return (
    <AppSnackbarProvider>
      <ViewClaim claim={claim} initialErrorMessage={initialErrorMessage} />
    </AppSnackbarProvider>
  );
}
