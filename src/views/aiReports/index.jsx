'use client';

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import AiReportsView from './AiReportsView';

const AiReportsIndex = ({ initialSuggestions = [] }) => (
  <AppSnackbarProvider maxSnack={7}>
    <AiReportsView initialSuggestions={initialSuggestions} />
  </AppSnackbarProvider>
);

export default AiReportsIndex;
