'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography
} from '@mui/material';



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
        <Table className={tableClassName} {...rest}>
          <TableHead className={`bg-secondaryLightest ${tableHeadClassName}`}>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  style={col.width ? { width: col.width } : {}}
                  align={col.align || 'left'}
                  className={`border-b-0 ${tableCellClassName}`}
                >
                  <Typography variant="overline" fontWeight="medium" fontSize="0.8rem">
                    {col.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowKey(row, rowIndex)} className={tableRowClassName}>
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    style={col.width ? { width: col.width } : {}}
                    align={col.align || 'left'}
                    className={tableCellClassName}
                  >
                    {col.renderCell ? col.renderCell(row, rowIndex) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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