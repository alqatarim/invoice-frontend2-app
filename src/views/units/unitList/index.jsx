'use client'

import React from "react";
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import UnitList from "@/views/units/unitList/UnitList";

const UnitListIndex = ({
  initialUnits = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <UnitList
        initialUnits={initialUnits}
        initialPagination={initialPagination}
        initialSummary={initialSummary}
        initialErrorMessage={initialErrorMessage}
      />
    </AppSnackbarProvider>
  );
};

export default UnitListIndex;
