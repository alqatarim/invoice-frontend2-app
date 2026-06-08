'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  TableContainer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import classnames from 'classnames';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

const getHideBelowSx = hideBelow => {
  if (hideBelow === 'md') {
    return { display: { xs: 'none', sm: 'none', md: 'table-cell' } };
  }

  if (hideBelow === 'sm') {
    return { display: { xs: 'none', sm: 'table-cell' } };
  }

  return {};
};

const getCellSx = (col, isMobile, isTablet) => ({
  ...getHideBelowSx(col.hideBelow),
  ...(col.minWidth && { minWidth: col.minWidth }),
  ...(col.width && { width: col.width }),
  padding: isMobile ? '6px 8px' : '8px 16px',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  fontSize: isMobile ? '0.8125rem' : isTablet ? '0.875rem' : undefined,
});

/**
 * @param {InvoiceItemsTableProps} props
 */
function InvoiceItemsTable({
  columns,
  rows,
  rowKey,
  emptyContent,
  addRowButton,
  tableClassName = '',
  tableHeadClassName = '',
  tableRowClassName = '',
  tableCellClassName = '',
  ...rest
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const tableMinWidth = isMobile ? 320 : isTablet ? 480 : 640;

  return (
    <Box>
      {rows.length > 0 ? (
        <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          <Table
            className={classnames(tableStyles.table, tableClassName)}
            sx={{ width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed' }}
            {...rest}
          >
            <TableHead className={tableHeadClassName}>
              <TableRow>
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    sx={getCellSx(col, isMobile, isTablet)}
                    className={tableCellClassName}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => {
                const key = rowKey ? rowKey(row, rowIndex) : rowIndex;
                return (
                  <TableRow key={key} className={classnames(tableRowClassName)}>
                    {columns.map(col => (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        sx={getCellSx(col, isMobile, isTablet)}
                        className={tableCellClassName}
                      >
                        {col.renderCell ? col.renderCell(row, rowIndex) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        emptyContent || (
          <Box className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <Typography variant="h6" color="text.primary">
              No Items
            </Typography>
          </Box>
        )
      )}
      {addRowButton && (
        <Box className="flex justify-start mt-3 ml-4 max-sm:ml-2 max-sm:mr-2 max-sm:is-full">
          {addRowButton}
        </Box>
      )}
    </Box>
  );
}

export default InvoiceItemsTable;
