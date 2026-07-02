'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import WarrantyList from './WarrantyList';

const WarrantyListIndex = props => (
  <AppSnackbarProvider maxSnack={7}>
    <WarrantyList {...props} />
  </AppSnackbarProvider>
);

export default WarrantyListIndex;
