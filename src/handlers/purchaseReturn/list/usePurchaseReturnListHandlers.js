'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { getPurchaseReturnColumns } from '@/views/debitNotes/listPurchaseReturn/purchaseReturnColumns';
import { columnsHandler } from './columnsHandler';
import { actionsHandler } from './actionsHandler';
import { usePermission } from '@/Auth/usePermission';

/**
 * Main purchase return list handlers - combines all handler logic
 */
export function usePurchaseReturnListHandlers({ setPage, onListUpdate }) {
  const theme = useTheme();
  
  // Permissions
  const permissions = {
    canView: usePermission('debitNote', 'view'),
    canCreate: usePermission('debitNote', 'create'),
    canUpdate: usePermission('debitNote', 'update'),
    canDelete: usePermission('debitNote', 'delete'),
  };

  // Get initial columns - only compute once based on stable values
  const initialColumns = useMemo(() => 
    getPurchaseReturnColumns({ theme, permissions }),
    [theme.palette?.mode, permissions.canView, permissions.canCreate, permissions.canUpdate, permissions.canDelete]
  );

  // Column state management
  const [columnsState, setColumnsState] = useState(() => {
    // Initialize with localStorage data on first render only
    const savedColumns = localStorage.getItem('purchaseReturnVisibleColumns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        const baseColumns = getPurchaseReturnColumns({ theme, permissions });
        // Merge with initial columns to handle new columns that might have been added
        return baseColumns.map(initialCol => {
          const savedCol = parsedColumns.find(col => col.key === initialCol.key);
          return savedCol ? { ...initialCol, visible: savedCol.visible } : initialCol;
        });
      } catch (error) {
        console.error('Error parsing saved columns:', error);
        return getPurchaseReturnColumns({ theme, permissions });
      }
    }
    return getPurchaseReturnColumns({ theme, permissions });
  });

  // Only update columns when permissions actually change (not on every render)
  useEffect(() => {
    const savedColumns = localStorage.getItem('purchaseReturnVisibleColumns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        // Merge with current columns to handle permission changes
        const mergedColumns = initialColumns.map(initialCol => {
          const savedCol = parsedColumns.find(col => col.key === initialCol.key);
          return savedCol ? { ...initialCol, visible: savedCol.visible } : initialCol;
        });
        setColumnsState(mergedColumns);
      } catch (error) {
        console.error('Error parsing saved columns:', error);
        setColumnsState(initialColumns);
      }
    } else {
      setColumnsState(initialColumns);
    }
  }, [permissions.canView, permissions.canCreate, permissions.canUpdate, permissions.canDelete]);

  // Handlers
  const columnHandlers = columnsHandler(columnsState);
  const actionHandlers = actionsHandler({ setPage, onListUpdate });

  // Table columns with handlers injected
  const tableColumns = useMemo(() =>
    columnsState.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row) => col.renderCell(row, {
          ...actionHandlers,
          permissions,
        }) : undefined
    })),
    [columnsState, actionHandlers, permissions]
  );

  return {
    // Column management
    ...columnHandlers,
    columnsState,
    setColumnsState,
    tableColumns,
    
    // Actions
    ...actionHandlers,
    
    // Utils
    permissions,
    theme,
  };
}