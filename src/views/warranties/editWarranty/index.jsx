'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import EditWarranty from './EditWarranty';

const EditWarrantyIndex = props => (
  <AppSnackbarProvider>
    <EditWarranty {...props} />
  </AppSnackbarProvider>
);

export default EditWarrantyIndex;
