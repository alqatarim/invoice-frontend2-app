'use client';

import { useState, useCallback } from 'react';

/**
 * Handler for payment summary column management.
 * Manages column visibility and preferences.
 */
export function columnsHandler(initialColumns = []) {
  const defaultColumns = [
    { key: 'index', label: '#', visible: true },
    { key: 'invoiceNumber', label: 'Invoice Number', visible: true },
    { key: 'customer', label: 'Customer', visible: true },
    { key: 'amount', label: 'Amount', visible: true },
    { key: 'date', label: 'Date', visible: true },
    { key: 'paymentMethod', label: 'Payment Method', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ];

  const [availableColumns, setAvailableColumns] = useState(
    initialColumns.length > 0 ? initialColumns : defaultColumns
  );
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true);
  }, []);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
  }, []);

  const handleColumnCheckboxChange = useCallback((columnKey) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback(() => {
    // Here you could save column preferences to localStorage or API
    const columnPreferences = availableColumns.reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {});
    
    localStorage.setItem('paymentSummaryColumnPreferences', JSON.stringify(columnPreferences));
    setManageColumnsOpen(false);
  }, [availableColumns]);

  return {
    availableColumns,
    manageColumnsOpen,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnCheckboxChange,
    handleManageColumnsSave,
  };
}