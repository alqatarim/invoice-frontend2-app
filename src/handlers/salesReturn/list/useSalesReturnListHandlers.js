'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { getSalesReturnColumns } from '@/views/salesReturn/listSalesReturn/salesReturnColumns';
import { columnsHandler } from './columnsHandler';
import { actionsHandler } from './actionsHandler';
import { usePermission } from '@/Auth/usePermission';

/**
 * Main sales return list handlers - combines all handler logic
 */
export function useSalesReturnListHandlers({ setPage, onListUpdate }) {
  const theme = useTheme();
  
  // Permissions
  const permissions = {
    canView: usePermission('creditNote', 'view'),
    canCreate: usePermission('creditNote', 'create'),
    canUpdate: usePermission('creditNote', 'update'),
    canDelete: usePermission('creditNote', 'delete'),
  };

  // Get initial columns
  const initialColumns = useMemo(() => 
    getSalesReturnColumns({ theme, permissions }),
    [theme, permissions]
  );

  // Column state management
  const [columnsState, setColumnsState] = useState(initialColumns);

  // Initialize columns from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('salesReturnVisibleColumns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        // Merge with initial columns to handle new columns that might have been added
        const mergedColumns = initialColumns.map(initialCol => {
          const savedCol = parsedColumns.find(col => col.key === initialCol.key);
          return savedCol ? { ...initialCol, visible: savedCol.visible } : initialCol;
        });
        setColumnsState(mergedColumns);
      } catch (error) {
        console.error('Error parsing saved columns:', error);
        setColumnsState(initialColumns);
      }
    }
  }, [initialColumns]);

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