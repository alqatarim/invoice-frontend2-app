import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
  Typography,
  TextField,
  TableContainer,
  CircularProgress,
  Collapse,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import classnames from 'classnames';

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue);
  const lastEmittedValueRef = useRef(initialValue);

  useEffect(() => {
    lastEmittedValueRef.current = initialValue;
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === lastEmittedValueRef.current) return;
      lastEmittedValueRef.current = value;
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size="small" />;
};

const headCellSx = {
  py: 2.5,
  px: 2,
  fontSize: '0.78rem',
  fontWeight: 500,
  lineHeight: 1.6,
  textTransform: 'uppercase',
  letterSpacing: '0.2px',
  whiteSpace: 'nowrap',
  borderBottom: 0,
  color: 'text.primary',
};

const bodyCellSx = (col) => ({
  py: 2.5,
  px: 2,
  fontSize: '0.875rem',
  verticalAlign: 'middle',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  ...(col.minWidth != null && { minWidth: col.minWidth }),
  ...(col.width != null && { width: col.width, maxWidth: col.width }),
});

const reservedRowCellSx = rowHeight => ({
  height: rowHeight,
  p: 0,
  borderBottom: 0,
});

/**
 * Compact table for dialogs and embedded forms. Same column/row API as CustomListTable.
 */
function CustomListTableSmall({
  columns = [],
  rows = [],
  rowKey,
  renderCell,
  emptyContent,
  addRowButton,
  tableClassName = '',
  tableRowClassName = '',
  tableCellClassName = '',
  pagination = false,
  onPageChange,
  onRowsPerPageChange,
  selectedRows = [],
  onRowSelect,
  loading = false,
  noDataText = 'No data found.',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  headerActions,
  title,
  onRowClick,
  enableHover = false,
  getRowClassName,
  expandedRows = {},
  expandableRowRender,
  tableMinWidth = '100%',
  maxTableHeight = 'min(42vh, 320px)',
  minBodyRows = 0,
  maxBodyRows = 0,
  reservedBodyRowHeight = 64,
  headerRowHeight = 48,
}) {
  const theme = useTheme();
  const expandedRowBackground = theme.palette.secondary.lightestOpacity;
  const headerBg = 'var(--mui-palette-customColors-tableHeaderBg)';

  const interactiveSelector =
    'a, button, input, select, textarea, [role="button"], [role="option"], [role="menuitem"], .MuiFormControl-root, .MuiMenuItem-root';

  const allSelected =
    rows.length > 0 && selectedRows && selectedRows.length === rows.length;
  const someSelected =
    selectedRows && selectedRows.length > 0 && selectedRows.length < rows.length;

  const handleSelectAll = e => {
    if (onRowSelect) {
      if (e.target.checked) {
        onRowSelect(rows.map((row, idx) => rowKey(row, idx)));
      } else {
        onRowSelect([]);
      }
    }
  };

  const handleSelectRow = rowId => e => {
    if (onRowSelect) {
      if (e.target.checked) {
        onRowSelect([...selectedRows, rowId]);
      } else {
        onRowSelect(selectedRows.filter(id => id !== rowId));
      }
    }
  };

  const showToolbar = showSearch || headerActions || title || addRowButton;
  const bodyRowCount = rows.length || 1;
  const reservedRowCount = Math.max(0, minBodyRows - bodyRowCount);
  const columnSpan = columns.length + (onRowSelect ? 1 : 0);
  const resolvedMaxTableHeight = maxBodyRows > 0
    ? headerRowHeight + reservedBodyRowHeight * maxBodyRows
    : maxTableHeight;
  const resolvedTableHeight =
    minBodyRows > 0 && maxBodyRows > 0 && minBodyRows === maxBodyRows
      ? resolvedMaxTableHeight
      : undefined;

  const reservedRows = reservedRowCount > 0
    ? Array.from({ length: reservedRowCount }, (_, index) => (
      <TableRow key={`reserved-row-${index}`} aria-hidden="true">
        <TableCell
          size="small"
          colSpan={columnSpan}
          sx={reservedRowCellSx(reservedBodyRowHeight)}
        />
      </TableRow>
    ))
    : null;

  return (
    <Box
      className={tableClassName}
      sx={{
        // border: 1,
        // borderColor: 'divider',
        // borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
      }}
    >
      {showToolbar && (
        <Box
          className="flex flex-wrap items-center justify-between gap-2"
          sx={{
            px: 1.5,
            py: 1,
          }}
        >
          <Box className="flex items-center gap-2 min-w-0">
            {title && (
              <Typography variant="subtitle2" color="text.primary" className="font-semibold">
                {title}
              </Typography>
            )}
            {showSearch && (
              <Box className="flex items-center gap-2">
                <DebouncedInput
                  value={searchValue ?? ''}
                  onChange={value => onSearchChange && onSearchChange(String(value))}
                  placeholder={searchPlaceholder}
                  className="max-sm:is-full"
                />
                {loading && (
                  <CircularProgress size={18} thickness={4} sx={{ color: 'primary.main', opacity: 0.7 }} />
                )}
              </Box>
            )}
          </Box>
          <Box className="flex gap-2 shrink-0">
            {headerActions}
            {addRowButton}
          </Box>
        </Box>
      )}

      <TableContainer
        sx={{
          height: resolvedTableHeight,
          maxHeight: resolvedMaxTableHeight,
          overflowX: 'auto',
          ...(maxBodyRows > 0 && { overflowY: 'auto' }),
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            width: '100%',
            minWidth: tableMinWidth,
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              {onRowSelect && (
                <TableCell size="small" sx={{ ...headCellSx, width: 40, minWidth: 40, bgcolor: headerBg }}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                  />
                </TableCell>
              )}
              {columns.map(col => (
                <TableCell
                  size="small"
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    ...headCellSx,
                    bgcolor: headerBg,
                    ...(col.minWidth != null && { minWidth: col.minWidth }),
                    ...(col.width != null && { width: col.width, maxWidth: col.width }),
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {rows.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  size="small"
                  colSpan={columnSpan}
                  align="center"
                  sx={{ py: 2, px: 1, fontSize: '0.8125rem', color: 'text.secondary' }}
                >
                  {emptyContent || noDataText}
                </TableCell>
              </TableRow>
              {reservedRows}
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((row, rowIdx) => {
                const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
                const isExpanded = expandedRows?.[row._id || key];
                const shouldHover = Boolean(onRowClick || enableHover);
                const isLastRow = rowIdx === rows.length - 1;

                return (
                  <React.Fragment key={key}>
                    <TableRow
                      hover={shouldHover}
                      className={classnames(tableRowClassName, getRowClassName?.(row, rowIdx) ?? '', {
                        selected: selectedRows.includes(key),
                      })}
                      onClick={event => {
                        if (!onRowClick) return;
                        const target = event?.target;
                        if (target?.closest?.(interactiveSelector)) return;
                        onRowClick(row, rowIdx, event);
                      }}
                      sx={{
                        ...(shouldHover && {
                          '&:hover': {
                            backgroundColor: isExpanded ? expandedRowBackground : 'action.hover',
                          },
                        }),
                        ...(onRowClick && { cursor: 'pointer' }),
                        ...(isLastRow && { '& > *': { borderBottom: 0 } }),
                        ...(isExpanded && {
                          backgroundColor: expandedRowBackground,
                          '& > *': { borderBottom: 'unset' },
                        }),
                      }}
                    >
                      {onRowSelect && (
                        <TableCell
                          size="small"
                          sx={{
                            ...bodyCellSx({ width: 40 }),
                            width: 40,
                            ...(isLastRow && { borderBottom: 0 }),
                          }}>
                          <Checkbox
                            size="small"
                            checked={selectedRows.includes(key)}
                            onChange={handleSelectRow(key)}
                            inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                          />
                        </TableCell>
                      )}
                      {columns.map(col => (
                        <TableCell
                          size="small"
                          key={col.key}
                          align={col.align || 'left'}
                          sx={{
                            ...bodyCellSx(col),
                            ...(isLastRow && { borderBottom: 0 }),
                          }}
                          className={tableCellClassName}
                        >
                          {col.renderCell
                            ? col.renderCell(row, rowIdx)
                            : renderCell
                              ? renderCell(row, col, rowIdx)
                              : row[col.key] ?? ''}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandableRowRender && (
                      <TableRow
                        sx={{
                          ...(isExpanded && { backgroundColor: expandedRowBackground }),
                        }}
                      >
                        <TableCell
                          size="small"
                          colSpan={columns.length + (onRowSelect ? 1 : 0)}
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          sx={{ border: 0, py: 0, px: 1 }}
                          onClick={event => {
                            if (!onRowClick || !isExpanded) return;
                            const target = event?.target;
                            if (target?.closest?.(interactiveSelector)) return;
                            onRowClick(row, rowIdx, event);
                          }}
                        >
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            {expandableRowRender(row, rowIdx)}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              {reservedRows}
            </TableBody>
          )}
        </Table>

      </TableContainer>



      {pagination && (
        <TablePagination
          size="small"
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          sx={{ borderTop: 1, borderColor: 'divider' }}
          count={pagination.total}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={(_, page) => {
            onPageChange && onPageChange(page);
          }}
          onRowsPerPageChange={e =>
            onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))
          }
        />
      )}
    </Box>
  );
}

export default CustomListTableSmall;
