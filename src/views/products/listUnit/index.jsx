'use client';

import React, { useState, useEffect } from 'react';
import ListUnit from '@/views/products/listUnit/listUnit';
import { getUnitList } from '@/app/(dashboard)/products/actions';

const UnitListComponent = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [unitList, setUnitList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const response = await getUnitList(page, size);
      if (response.success) {
        setUnitList(response.data || []);
        setTotalCount(response.data.length);
      }
    };
    fetchInitialData();
  }, [page, size]);

  return (
    <ListUnit
      page={page}
      setPage={setPage}
      size={size}
      setSize={setSize}
      initialSortBy="name"
      initialSortDirection="asc"
      initialUnitList={unitList}
      initialTotalCount={totalCount}
      setTotalCount={setTotalCount}
      setUnitList={setUnitList}
    />
  );
};

export default UnitListComponent;
