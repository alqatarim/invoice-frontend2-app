'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import ClaimList from './ClaimList';

const ClaimListIndex = props => (
  <AppSnackbarProvider maxSnack={7}>
    <ClaimList {...props} />
  </AppSnackbarProvider>
);

export default ClaimListIndex;
