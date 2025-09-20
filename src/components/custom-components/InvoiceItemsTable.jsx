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
  TableContainer
} from '@mui/material';
import classnames from 'classnames';

// Style Imports
import tableStyles from '@core/styles/table.module.css';



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
  return (
    <Box>
      {rows.length > 0 ? (
        <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table className={classnames(tableStyles.table, tableClassName)} sx={{ minWidth: 800 }} {...rest}>
          <TableHead className={tableHeadClassName}>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    ...(col.minWidth && { minWidth: col.minWidth }),
                    ...(col.width && { width: col.width }),
                    padding: '8px 16px',
                    '@media (max-width: 768px)': {
                      padding: '6px 8px',
                      fontSize: '0.875rem'
                    }
                  }}
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
                      sx={{
                        ...(col.minWidth && { minWidth: col.minWidth }),
                        ...(col.width && { width: col.width }),
                        padding: '8px 16px',
                        '@media (max-width: 768px)': {
                          padding: '6px 8px',
                          fontSize: '0.875rem'
                        }
                      }}
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
        <Box className="flex justify-start mt-3 ml-4">
          {addRowButton}
        </Box>
      )}
    </Box>
  );
}

export default InvoiceItemsTable;