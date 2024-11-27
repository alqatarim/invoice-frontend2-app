'use client';

import React, { useState, useEffect } from 'react';
import ListCategory from '@/views/products/listCategory/listCategory';
import { getCategoryList } from '@/app/(dashboard)/products/actions';

const CategoryListComponent = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [categoryList, setCategoryList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const response = await getCategoryList(page, size);
      if (response.success) {
        setCategoryList(response.data || []);
        setTotalCount(response.data.length);
      }
    };
    fetchInitialData();
  }, [page, size]);

  return (
    <ListCategory
      page={page}
      setPage={setPage}
      size={size}
      setSize={setSize}
      initialSortBy="name"
      initialSortDirection="asc"
      initialCategoryList={categoryList}
      initialTotalCount={totalCount}
      setTotalCount={setTotalCount}
      setCategoryList={setCategoryList}
    />
  );
};

export default CategoryListComponent;
