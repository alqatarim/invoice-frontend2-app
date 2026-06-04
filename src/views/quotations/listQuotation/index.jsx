'use client';

import React from 'react';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import QuotationList from '@/views/quotations/listQuotation/QuotationList';

const QuotationListIndex = props => (
  <AppSnackbarProvider>
    <QuotationList {...props} />
  </AppSnackbarProvider>
);

export default QuotationListIndex;
