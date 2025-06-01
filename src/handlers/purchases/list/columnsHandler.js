'use client'

import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Column visibility management for purchase list.
 */
export function columnsHandler(initialColumns = []) {
  const [availableColumns, setAvailableColumns] = useState(initialColumns);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  // Sync availableColumns with initialColumns when dialog is opened
  useEffect(() => {
    if (manageColumnsOpen) {
      setAvailableColumns(initialColumns);
    }
  }, [manageColumnsOpen, initialColumns]);

  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true);
  }, []);

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
    localStorage.setItem('purchaseVisibleColumns', JSON.stringify(availableColumns));
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