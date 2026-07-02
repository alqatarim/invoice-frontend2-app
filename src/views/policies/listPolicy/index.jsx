'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import PolicyList from './PolicyList';

const PolicyListIndex = props => (
  <AppSnackbarProvider maxSnack={7}>
    <PolicyList {...props} />
  </AppSnackbarProvider>
);

export default PolicyListIndex;
