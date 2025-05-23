import React from 'react';
import {
  Box,
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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
}) {
  // Selection helpers
  const allSelected =
    rows.length > 0 && selectedRows && selectedRows.length === rows.length;
  const someSelected =
    selectedRows && selectedRows.length > 0 && selectedRows.length < rows.length;


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
        <TableCell padding="checkbox">
          <Skeleton variant="circular" width={24} height={24} />
        </TableCell>
      )}
      {columns.map((col) => (
        <TableCell key={col.key} align={col.align || 'left'}>
          <Skeleton width={col.skeletonWidth || 80} />
        </TableCell>
      ))}
      {columns.some((col) => col.key === 'action') && (
        <TableCell align="right">
          <Skeleton variant="circular" width={32} height={32} />
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <Box>
      <Table className={tableClassName}>
        <TableHead  className={`bg-secondaryLightest ${tableHeadClassName}`}>
          <TableRow >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || 'center'}
                style={col.width ? { width: col.width } : {}}
                sortDirection={sortBy === col.key ? sortDirection : false}
                className={`border-b-0 ${tableCellClassName} uppercase px-3`}
              >
                {col.sortable && onSort ? (
                  <TableSortLabel
                    active={sortBy === col.key}
                    direction={sortBy === col.key ? sortDirection : 'asc'}
                    onClick={() => onSort(col.key)}
                  >
                   <Typography variant="overline" fontWeight={500} color="text.secondary">
                    {col.label}
                  </Typography>
                  </TableSortLabel>
                ) : (
             <Typography variant="overline" fontWeight={500} color="text.secondary">
                    {col.label}
                  </Typography>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody >
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
            : rows.length > 0
            ? rows.map((row, rowIdx) => (
                <TableRow key={rowKey(row, rowIdx)} hover className={tableRowClassName}>
                  {onRowSelect && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(rowKey(row, rowIdx))}
                        onChange={handleSelectRow(rowKey(row, rowIdx))}
                        inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align || 'center'}
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
              ))
            : (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowSelect ? 2 : 1)} align="center">
                  {emptyContent || (
                    <Box className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <Typography variant="h6" color="text.primary">
                        {noDataText}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={onPageChange}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
      {addRowButton && (
        <Box className="flex justify-start mt-3 ml-4">{addRowButton}</Box>
      )}
    </Box>
  );
}

export default CustomListTable;