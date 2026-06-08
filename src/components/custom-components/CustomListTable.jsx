import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  TextField,
  Button,
  TableContainer,
  CircularProgress,
  Collapse,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import classnames from 'classnames';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import CustomListTableMobileCards, { filterColumnsForViewport } from './CustomListTableMobileCards';

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {'left'|'center'|'right'} [align]
 * @property {string|number} [width]
 * @property {boolean} [sortable]
 * @property {number} [skeletonWidth]
 * @property {(row: any, rowIdx: number) => React.ReactNode} [renderCell]
 * @property {'sm'|'md'} [hideBelow]
 */

const getHideBelowSx = hideBelow => {
  if (hideBelow === 'md') {
    return { display: { xs: 'none', sm: 'none', md: 'table-cell' } }
  }

  if (hideBelow === 'sm') {
    return { display: { xs: 'none', sm: 'table-cell' } }
  }

  return {}
}

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

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />;
};

/**
 * Stateless, reusable, presentational table component.
 * @param {CustomListTableProps} props
 */
function CustomListTable({
  columns = [],
  rows = [],
  rowKey,
  renderCell,
  emptyContent,
  addRowButton,
  tableClassName = '',
  tableHeadClassName = '',
  tableRowClassName = '',
  tableCellClassName = '',
  pagination = { page: 0, pageSize: 10, total: 0 },
  onPageChange,
  onRowsPerPageChange,
  sortBy = '',
  sortDirection = 'asc',
  onSort,
  selectedRows = [],
  onRowSelect,
  loading = false,
  noDataText = 'No data found.',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchControls,
  headerActions,
  title,
  onRowClick,
  enableHover = true,
  getRowClassName,
  expandedRows = {},
  expandableRowRender,
  tableMinWidth = '720px',
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const useMobileCards = isTablet;
  const visibleColumns = useMemo(
    () => filterColumnsForViewport(columns, { isMobile, isTablet }),
    [columns, isMobile, isTablet]
  );
  const tableColumns = useMemo(
    () => (useMobileCards ? visibleColumns : columns),
    [useMobileCards, visibleColumns, columns]
  );
  const resolvedTableMinWidth = tableMinWidth;
  const cellPadding = isMobile ? '8px 10px' : '12px 16px';
  const cellFontSize = isMobile ? '0.8125rem' : '0.875rem';
  // Use a distinct light info tint for expanded rows (different from header background)
  const expandedRowBackground = theme.palette.secondary.lightestOpacity;

  // Simplified selector for interactive elements
  // .MuiFormControl-root covers almost all MUI inputs (Select, TextField, etc.)
  // [role="option"] covers the dropdown menu items bubbling from Portals
  const interactiveSelector = 'a, button, input, select, textarea, [role="button"], [role="option"], [role="menuitem"], .MuiFormControl-root, .MuiMenuItem-root';

  // Selection helpers
  const allSelected =
    rows.length > 0 && selectedRows && selectedRows.length === rows.length;
  const someSelected =
    selectedRows && selectedRows.length > 0 && selectedRows.length < rows.length;

  const handleSelectAll = (e) => {
    if (onRowSelect) {
      if (e.target.checked) {
        onRowSelect(rows.map((row, idx) => rowKey(row, idx)));
      } else {
        onRowSelect([]);
      }
    }
  };

  const handleSelectRow = (rowId) => (e) => {
    if (onRowSelect) {
      if (e.target.checked) {
        onRowSelect([...selectedRows, rowId]);
      } else {
        onRowSelect(selectedRows.filter((id) => id !== rowId));
      }
    }
  };

  return (
    <Card sx={{ overflow: 'hidden', maxWidth: '100%' }}>
      {(showSearch || headerActions || title || addRowButton) && (
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className="flex items-center gap-4">
            {title && (
              <Typography variant="h6" color="text.primary">
                {title}
              </Typography>
            )}
            {showSearch && (
              <div className="flex items-center gap-2 flex-wrap max-sm:flex-col max-sm:items-stretch max-sm:is-full">
                <DebouncedInput
                  value={searchValue ?? ''}
                  onChange={value => onSearchChange && onSearchChange(String(value))}
                  placeholder={searchPlaceholder}
                  className='max-sm:is-full'
                />
                {searchControls}
                {loading && (
                  <CircularProgress
                    size={20}
                    thickness={4}
                    sx={{
                      color: 'primary.main',
                      opacity: 0.7
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            {headerActions}
            {addRowButton}
          </div>
        </CardContent>
      )}

      {useMobileCards ? (
        <CustomListTableMobileCards
          columns={visibleColumns}
          rows={rows}
          rowKey={rowKey}
          renderCell={renderCell}
          emptyContent={emptyContent}
          noDataText={noDataText}
          onRowClick={onRowClick}
          enableHover={enableHover}
          getRowClassName={getRowClassName}
          selectedRows={selectedRows}
          onRowSelect={onRowSelect}
          expandedRows={expandedRows}
          expandableRowRender={expandableRowRender}
          interactiveSelector={interactiveSelector}
        />
      ) : (
      <TableContainer
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxHeight: '70vh',
          width: '100%',
          '& > .MuiTable-root > .MuiTableHead-root': {
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }
        }}
      >
        <Table
          className={classnames(tableStyles.table, tableClassName)}
          sx={{
            minWidth: resolvedTableMinWidth,
            tableLayout: 'auto',
            whiteSpace: 'normal',
          }}
          stickyHeader
        >
          <TableHead
            align={'end'}
          >
            <TableRow>
              {onRowSelect && (
                <TableCell sx={{ minWidth: 50 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                  />
                </TableCell>
              )}
              {tableColumns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  sx={{
                    ...getHideBelowSx(col.hideBelow),
                    ...(col.minWidth && { minWidth: col.minWidth }),
                    ...(col.width && { width: col.width }),
                    padding: cellPadding,
                    fontSize: cellFontSize,
                    whiteSpace: 'nowrap',
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
                <TableCell colSpan={tableColumns.length + (onRowSelect ? 1 : 0)} className='text-center'>
                  {emptyContent || noDataText}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((row, rowIdx) => {
                const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
                const isExpanded = expandedRows?.[row._id || key];
                const shouldHover = Boolean(onRowClick || enableHover);
                return (
                  <React.Fragment key={key}>
                    <TableRow
                      hover={shouldHover}
                      className={classnames(
                        tableRowClassName,
                        getRowClassName ? getRowClassName(row, rowIdx) : '',
                        { selected: selectedRows.includes(key) }
                      )}
                      onClick={(event) => {
                        if (!onRowClick) return;
                        const target = event?.target;
                        // Check if click is on an interactive element
                        if (target?.closest?.(interactiveSelector)) return;
                        onRowClick(row, rowIdx, event);
                      }}
                      sx={{
                        transition: 'background-color 200ms ease',
                        ...(shouldHover && {
                          '&:hover': {
                            backgroundColor: isExpanded ? expandedRowBackground : 'action.hover',
                          },
                        }),
                        ...(onRowClick && {
                          cursor: 'pointer',
                        }),
                        // MUI pattern: remove bottom border from all children when expanded
                        ...(isExpanded && {
                          backgroundColor: expandedRowBackground,
                          '& > *': { borderBottom: 'unset' },
                          borderBlockEnd: 'none !important', // Remove CSS module border on TR
                        }),
                      }}
                    >
                      {onRowSelect && (
                        <TableCell sx={{ minWidth: 50 }}>
                          <Checkbox
                            checked={selectedRows.includes(key)}
                            onChange={handleSelectRow(key)}
                            inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                          />
                        </TableCell>
                      )}
                      {tableColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align={col.align || 'left'}
                          sx={{
                            ...(col.minWidth && { minWidth: col.minWidth }),
                            ...(col.width && { width: col.width }),
                            padding: cellPadding,
                            fontSize: cellFontSize,
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
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
                    {/* Expandable row content - follows MUI collapsible table pattern */}
                    {expandableRowRender && (
                      <TableRow
                        sx={{
                          ...(isExpanded && { backgroundColor: expandedRowBackground }),
                        }}
                      >
                        <TableCell
                          colSpan={tableColumns.length + (onRowSelect ? 1 : 0)}
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          sx={{
                            border: 0,
                            // Ensure cell height follows content (Collapse animation)
                            // and overrides the fixed 50px height from css module
                            blockSize: 'auto !important',
                            '& > .MuiCollapse-root': {
                              minHeight: '0 !important',
                            }
                          }}
                          onClick={(event) => {
                            if (!onRowClick || !isExpanded) return;
                            const target = event?.target;
                            // Check if click is on an interactive element
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
            </TableBody>
          )}
        </Table>
      </TableContainer>
      )}

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          className='border-bs'
          count={pagination.total}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={(_, page) => {
            onPageChange && onPageChange(page);
          }}
          onRowsPerPageChange={e => onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))}
        />
      )}
    </Card>
  );
}

export default CustomListTable;