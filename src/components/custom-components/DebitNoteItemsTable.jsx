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
  Button
} from '@mui/material';
import { Icon } from '@iconify/react';

/**
 * DebitNoteItemsTable Component
 */
function DebitNoteItemsTable({
  columns,
  items,
  onAddRow,
  rowKey,
  emptyContent,
  tableClassName = '',
  tableHeadClassName = '',
  tableRowClassName = '',
  tableCellClassName = '',
  ...rest
}) {
  return (
    <Box>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="font-semibold text-textSecondary">
          Items
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Icon icon="tabler:plus" />}
          onClick={onAddRow}
          size="small"
        >
          Add Item
        </Button>
      </div>

      {items && items.length > 0 ? (
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
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={rowKey ? rowKey(item, index) : index}
                className={tableRowClassName}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    style={col.width ? { width: col.width } : {}}
                    className={tableCellClassName}
                  >
                    {col.renderCell ? col.renderCell(item, index) : item[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box className="text-center py-8">
          <Typography variant="body2" color="text.secondary">
            {emptyContent || 'No items added yet. Click "Add Item" to get started.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="tabler:plus" />}
            onClick={onAddRow}
            className="mt-4"
          >
            Add First Item
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DebitNoteItemsTable;