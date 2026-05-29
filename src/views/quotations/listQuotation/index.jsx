'use client';

import React from "react";
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import ListQuotation from "@/views/quotations/listQuotation/listQuotation";

const QuotationListIndex = ({
  initialQuotations = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCustomers = [],
  initialErrorMessage = ''
}) => {
  const snackbarAction = snackbarId => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <ListQuotation
        initialQuotations={initialQuotations}
        initialPagination={initialPagination}
        initialCustomers={initialCustomers}
        initialErrorMessage={initialErrorMessage}
      />
    </SnackbarProvider>
  );
};

export default QuotationListIndex;