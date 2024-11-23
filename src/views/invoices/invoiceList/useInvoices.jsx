// views/invoices/useInvoices.js
'use client';

import { useState, useEffect } from 'react';
import {
  getFilteredInvoices,
  cloneInvoice,
  convertToSalesReturn,
  sendInvoice,
  sendPaymentLink,
  updateRecurringStatus
} from '@/app/invoices/invoiceActions';

export function useInvoices(initialData) {
  const [invoices, setInvoices] = useState(initialData.invoices);
  const [activeTab, setActiveTab] = useState('ALL');
  const [pagination, setPagination] = useState(initialData.pagination);
  const [currencyData, setCurrencyData] = useState('SAR'); // Set default or fetch from API

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    const data = await getFilteredInvoices(tab, 1, pagination.pageSize);
    setInvoices(data.invoices);
    setPagination(data.pagination);
  };

  const handlePagination = async (page, pageSize) => {
    const data = await getFilteredInvoices(activeTab, page, pageSize);
    setInvoices(data.invoices);
    setPagination(data.pagination);
  };

  const handleFilter = async (filterParams) => {
    const data = await getFilteredInvoices(activeTab, 1, pagination.pageSize, filterParams);
    setInvoices(data.invoices);
    setPagination(data.pagination);
  };

  const handleClone = async (id) => {
    const newInvoice = await cloneInvoice(id);
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleConvertToSalesReturn = async (id) => {
    await convertToSalesReturn(id);
    handleTabChange(activeTab);
  };

  const handleSendInvoice = async (id) => {
    await sendInvoice(id);
    // Optionally refresh the list or update the status
  };

  const handleSendPaymentLink = async (id) => {
    await sendPaymentLink(id);
    // Optionally refresh the list or update the status
  };

  const handleRequiringStatus = async (id) => {
    await updateRecurringStatus(id);
    // Refresh the list to reflect the updated status
    handleTabChange(activeTab);
  };

  return {
    invoices,
    activeTab,
    currencyData,
    pagination,
    handleTabChange,
    handlePagination,
    handleFilter,
    handleClone,
    handleConvertToSalesReturn,
    handleSendInvoice,
    handleSendPaymentLink,
    handleRequiringStatus,
  };
}
