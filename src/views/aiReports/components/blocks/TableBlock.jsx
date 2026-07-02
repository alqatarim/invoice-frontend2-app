'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { formatCurrency } from '@/views/accounting/utils';

const formatCell = (value, format) => {
  if (format === 'currency') return `SAR ${formatCurrency(value)}`;
  if (format === 'percent') return `${Number(value || 0).toFixed(1)}%`;
  if (format === 'boolean') return value ? 'Yes' : 'No';
  if (format === 'number') return Number(value || 0).toLocaleString();
  return value === null || value === undefined || value === '' ? '-' : String(value);
};

const TableBlock = ({ title = '', columns = [], rows = [] }) => {
  if (!rows.length) return null;

  const resolvedColumns =
    columns.length > 0
      ? columns
      : Object.keys(rows[0] || {})
          .filter((key) => !key.startsWith('_') && key !== 'groupKey')
          .slice(0, 5)
          .map((key) => ({ key, label: key }));

  return (
    <Box>
      {title ? (
        <Typography variant='subtitle1' sx={{ mb: 1.25, fontWeight: 700 }}>
          {title}
        </Typography>
      ) : null}
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ maxHeight: 360 }}
      >
        <Table size='small' stickyHeader>
          <TableHead>
            <TableRow>
              {resolvedColumns.map((column) => (
                <TableCell key={column.key} sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.groupKey || rowIndex} hover>
                {resolvedColumns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.key}`}>
                    {formatCell(row[column.key], column.format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableBlock;
