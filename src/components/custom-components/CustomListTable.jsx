import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Tooltip,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import classnames from 'classnames';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {'left'|'center'|'right'} [align]
 * @property {string|number} [width]
 * @property {boolean} [sortable]
 * @property {number} [skeletonWidth]
 * @property {(row: any, rowIdx: number) => React.ReactNode} [renderCell]
 */

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
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
  headerActions,
  title,
}) {
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

  // Skeleton row for loading
  const TableRowSkeleton = () => (
    <TableRow>
      {onRowSelect && (
        <TableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </TableCell>
      )}
      {columns.map((col) => (
        <TableCell key={col.key} align={col.align || 'left'}>
          <Skeleton width={col.skeletonWidth || 80} />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <Card>
      {(showSearch || headerActions || title || addRowButton) && (
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className="flex items-center gap-4">
            {title && (
              <Typography variant="h6" color="text.primary">
                {title}
              </Typography>
            )}
            {showSearch && (
              <DebouncedInput
                value={searchValue ?? ''}
                onChange={value => onSearchChange && onSearchChange(String(value))}
                placeholder={searchPlaceholder}
                className='max-sm:is-full'
              />
            )}
          </div>
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            {headerActions}
            {addRowButton}
          </div>
        </CardContent>
      )}
      
      <div className='overflow-x-auto'>
        <Table className={classnames(tableStyles.table, tableClassName)}>
          <TableHead>
            <TableRow>
              {onRowSelect && (
                <TableCell>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell 
                  key={col.key} 
                  align={col.align || 'left'}
                  style={col.width ? { width: col.width } : {}}
                  className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}
                >
                  {col.sortable && onSort ? (
                    <div
                      className={classnames({
                        'flex items-center': sortBy === col.key,
                        'cursor-pointer select-none': true
                      })}
                      onClick={() => onSort(col.key)}
                    >
                      {col.label}
                      {sortBy === col.key && (
                        sortDirection === 'asc' ? 
                          <i className='ri-arrow-up-s-line text-xl' /> :
                          <i className='ri-arrow-down-s-line text-xl' />
                      )}
                    </div>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)}
            </TableBody>
          ) : rows.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + (onRowSelect ? 1 : 0)} className='text-center'>
                  {emptyContent || noDataText}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((row, rowIdx) => {
                const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
                return (
                  <TableRow key={key} className={classnames(tableRowClassName, { selected: selectedRows.includes(key) })}>
                    {onRowSelect && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(key)}
                          onChange={handleSelectRow(key)}
                          inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        style={col.width ? { width: col.width } : {}}
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
                );
              })}
            </TableBody>
          )}
        </Table>
      </div>
      
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