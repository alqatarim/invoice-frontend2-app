'use client'

import React, { useState, useEffect } from "react";
import InvoiceList from "./InvoiceList";
import { getInitialInvoiceData, getFilteredInvoices } from '@/app/(dashboard)/invoices/actions';

const InvoiceListComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [cardCounts, setCardCounts] = useState({});
  const [tab, setTab] = useState('ALL');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchData = async (tabValue, page, pageSize, filterValues, sortBy, sortDirection) => {
    setIsLoading(true);

    try {
      let response;
      if (tabValue === 'ALL' && Object.keys(filterValues || {}).length === 0) {
        response = await getInitialInvoiceData(page, pageSize);
      } else {
        response = await getFilteredInvoices(tabValue, page, pageSize, filterValues, sortBy, sortDirection);
      }

      setInvoices(response?.invoices || []);
      setPagination({
        current: page || 1,
        pageSize: pageSize || 10,
        total: response?.pagination?.total || 0
      });
      setCardCounts(response?.cardCounts || {});
      setTab(tabValue || 'ALL');
      setFilters(filterValues || {});
    } catch (error) {
      console.error('Error loading invoice data:', error);
      setInvoices([]);
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
    fetchData('ALL', 1, 10, {});
  }, []);

  const handlePaginationChange = (newPagination) => {
    fetchData(
      tab,
      newPagination.current,
      newPagination.pageSize,
      filters
    );
  };

  const handleTabChange = (newTab) => {
    fetchData(newTab, 1, pagination.pageSize, filters);
  };

  const handleFiltersChange = (newFilters) => {
    fetchData(tab, 1, pagination.pageSize, newFilters);
  };

  return (
    <InvoiceList
      invoices={invoices}
      pagination={pagination}
      cardCounts={cardCounts}
      tab={tab}
      filters={filters}
      isLoading={isLoading}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onPaginationChange={handlePaginationChange}
      onTabChange={handleTabChange}
      onFiltersChange={handleFiltersChange}
      onSortChange={(newSortBy, newSortDirection) => {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        fetchData(tab, pagination.current, pagination.pageSize, filters, newSortBy, newSortDirection);
      }}
      fetchData={fetchData}
    />
  );
};

export default InvoiceListComponent;