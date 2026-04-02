'use client'

import React from "react";
import UnitList from "@/views/units/unitList/UnitList";

const UnitListIndex = ({
  initialUnits = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <UnitList
      initialUnits={initialUnits}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default UnitListIndex;
