'use client'

import React from "react";
import UnitList from "@/views/units/unitList/UnitList";

const UnitListIndex = ({ initialData }) => {
  return (
    <UnitList
      initialUnits={initialData?.units || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
    />
  );
};

export default UnitListIndex;
