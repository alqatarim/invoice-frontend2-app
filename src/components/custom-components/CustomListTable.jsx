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
    <tr>
      {onRowSelect && (
        <td>
          <Skeleton variant="circular" width={24} height={24} />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.key}>
          <Skeleton width={col.skeletonWidth || 80} />
        </td>
      ))}
    </tr>
  );

  return (
    <Card>
      {(showSearch || headerActions || title) && (
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
          {headerActions && (
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              {headerActions}
            </div>
          )}
        </CardContent>
      )}
      
      <div className='overflow-x-auto'>
        <table className={classnames(tableStyles.table, tableClassName)}>
          <thead>
            <tr>
              {onRowSelect && (
                <th>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : {}}>
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
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)}
            </tbody>
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length + (onRowSelect ? 1 : 0)} className='text-center'>
                  {emptyContent || noDataText}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {rows.map((row, rowIdx) => {
                const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
                return (
                  <tr key={key} className={classnames(tableRowClassName, { selected: selectedRows.includes(key) })}>
                    {onRowSelect && (
                      <td>
                        <Checkbox
                          checked={selectedRows.includes(key)}
                          onChange={handleSelectRow(key)}
                          inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={col.width ? { width: col.width } : {}}
                        className={tableCellClassName}
                      >
                        {col.renderCell
                          ? col.renderCell(row, rowIdx)
                          : renderCell
                          ? renderCell(row, col, rowIdx)
                          : row[col.key] ?? ''}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
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
      
      {addRowButton && (
        <Box className="flex justify-start mt-3 ml-4">{addRowButton}</Box>
      )}
    </Card>
  );
}

export default CustomListTable;