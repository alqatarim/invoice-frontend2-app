// Column handler utilities for InvoiceList

export function handleManageColumnsOpen(setAvailableColumns, setManageColumnsOpen, columns) {
  setAvailableColumns(columns);
  setManageColumnsOpen(true);
}

export function handleManageColumnsClose(setManageColumnsOpen) {
  setManageColumnsOpen(false);
}

export function handleColumnToggle(setAvailableColumns, columnKey) {
  setAvailableColumns(prevColumns =>
    prevColumns.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    )
  );
}

export function handleManageColumnsSave(setColumns, setManageColumnsOpen, availableColumns) {
  setColumns(availableColumns);
  setManageColumnsOpen(false);
}
