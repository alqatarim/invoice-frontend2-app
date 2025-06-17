'use client'

import { useState, useEffect } from 'react';

/**
 * Column visibility management for payment list
 */
export function columnsHandler(initialColumns = []) {
  // Load from localStorage or use initial columns
  const [availableColumns, setAvailableColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paymentVisibleColumns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : initialColumns;
        } catch (e) {
          console.warn('Failed to parse saved column preferences:', e);
        }
      }
    }
    return initialColumns;
  });

  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  // Update availableColumns when initialColumns change
  useEffect(() => {
    if (initialColumns.length > 0) {
      setAvailableColumns(initialColumns);
    }
  }, [initialColumns]);

  const handleManageColumnsOpen = () => setManageColumnsOpen(true);
  const handleManageColumnsClose = () => setManageColumnsOpen(false);

  const handleColumnCheckboxChange = (columnKey, checked) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: checked } : col
      )
    );
  };

  const handleManageColumnsSave = () => {
    setManageColumnsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paymentVisibleColumns', JSON.stringify(availableColumns));
    }
  };

  
  return {
    availableColumns,
    manageColumnsOpen,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnCheckboxChange,
    handleManageColumnsSave,
  };
}