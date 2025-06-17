'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/**
 * Column visibility management for delivery challan list
 * Optimized to prevent infinite rendering loops
 */
export function columnsHandler(initialColumns = []) {
  const [availableColumns, setAvailableColumns] = useState([]);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  // Use ref to track if columns have been initialized to prevent loops
  const isInitialized = useRef(false);
  const previousColumnsLength = useRef(0);

  // Stabilize initial columns to prevent unnecessary effects
  const stableInitialColumns = useMemo(() => {
    // Only update if length actually changed
    if (initialColumns.length !== previousColumnsLength.current) {
      previousColumnsLength.current = initialColumns.length;
      return initialColumns;
    }
    return initialColumns;
  }, [initialColumns.length]);

  // Initialize columns from localStorage or defaults - only once
  useEffect(() => {
    if (isInitialized.current || stableInitialColumns.length === 0) return;

    const loadColumns = () => {
      try {
        const savedColumns = localStorage.getItem('deliveryChallanVisibleColumns');
        if (savedColumns) {
          const parsedColumns = JSON.parse(savedColumns);
          // Merge saved visibility with initial columns to handle new columns
          const mergedColumns = stableInitialColumns.map(initialCol => {
            const savedCol = parsedColumns.find(saved => saved.key === initialCol.key);
            return savedCol ? { ...initialCol, visible: savedCol.visible } : initialCol;
          });
          setAvailableColumns(mergedColumns);
        } else {
          setAvailableColumns(stableInitialColumns);
        }
      } catch (error) {
        console.error('Error loading saved columns:', error);
        setAvailableColumns(stableInitialColumns);
      }
      isInitialized.current = true;
    };

    loadColumns();
  }, [stableInitialColumns]);

  // Memoized handlers to prevent recreation
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
    // Update the main columns state if provided
    if (setColumns) {
      setColumns(availableColumns);
    }

    // Save to localStorage
    try {
      localStorage.setItem('deliveryChallanVisibleColumns', JSON.stringify(availableColumns));
    } catch (error) {
      console.error('Error saving columns to localStorage:', error);
    }

    // Close dialog
    setManageColumnsOpen(false);
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

  // Memoized return object to prevent recreation on every render
  return useMemo(() => ({
    availableColumns,
    manageColumnsOpen,
    visibleColumnsCount,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnToggle,
    handleManageColumnsSave,
    handleColumnCheckboxChange,
  }), [
    availableColumns,
    manageColumnsOpen,
    visibleColumnsCount,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnToggle,
    handleManageColumnsSave,
    handleColumnCheckboxChange,
  ]);
}