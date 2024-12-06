'use client';

import React, { useState, useEffect } from 'react';
import InventoryList from '@/views/inventory/inventoryList/InventoryList';
import { getInitialInventoryData, getFilteredInventory } from '@/app/(dashboard)/inventory/actions';

const InventoryListComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchData = async (page, pageSize, filterValues, sortBy, sortDirection) => {
    setIsLoading(true);
    try {
      let response;
      if (Object.keys(filterValues || {}).length === 0) {
        response = await getInitialInventoryData();
      } else {
        response = await getFilteredInventory(page, pageSize, filterValues, sortBy, sortDirection);
      }

      setInventory(response?.inventory || []);
      setPagination({
        current: page || 1,
        pageSize: pageSize || 10,
        total: response?.pagination?.total || 0
      });
      setFilters(filterValues || {});
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setInventory([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10, {});
  }, []);

  const handlePaginationChange = (newPagination) => {
    fetchData(
      newPagination.current,
      newPagination.pageSize,
      filters
    );
  };

  const handleFiltersChange = (newFilters) => {
    fetchData(1, pagination.pageSize, newFilters);
  };

  return (
    <InventoryList
      inventory={inventory}
      pagination={pagination}
      filters={filters}
      isLoading={isLoading}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onPaginationChange={handlePaginationChange}
      onFiltersChange={handleFiltersChange}
      onSortChange={(newSortBy, newSortDirection) => {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        fetchData(pagination.current, pagination.pageSize, filters, newSortBy, newSortDirection);
      }}
      fetchData={fetchData}
    />
  );
};

export default InventoryListComponent;