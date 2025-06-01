'use client'

import { useState, useCallback, useMemo } from 'react';

/**
 * Column visibility management for sales return list.
 */
export function columnsHandler(initialColumns = []) {
  const [availableColumns, setAvailableColumns] = useState(initialColumns);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  const handleManageColumnsOpen = useCallback(() => {
    setAvailableColumns(initialColumns);
    setManageColumnsOpen(true);
  }, [initialColumns]);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
  }, []);

  const handleColumnToggle = useCallback((columnKey) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(availableColumns);
    setManageColumnsOpen(false);
    localStorage.setItem('salesReturnVisibleColumns', JSON.stringify(availableColumns));
  }, [availableColumns]);

  const handleColumnCheckboxChange = useCallback((columnKey, checked) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: checked } : col
      )
    );
  }, []);

  // Memoize visible columns count
  const visibleColumnsCount = useMemo(() =>
    availableColumns.filter(col => col.visible).length,
    [availableColumns]
  );

  return {
    availableColumns,
    manageColumnsOpen,
    visibleColumnsCount,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnToggle,
    handleManageColumnsSave,
    handleColumnCheckboxChange,
  };
}