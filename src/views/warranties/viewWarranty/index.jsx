'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import ViewWarranty from './ViewWarranty';

const ViewWarrantyIndex = props => (
  <AppSnackbarProvider>
    <ViewWarranty {...props} />
  </AppSnackbarProvider>
);

export default ViewWarrantyIndex;
