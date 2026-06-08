'use client';

import React from 'react';
import { Box, Checkbox, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const ACTION_COLUMN_KEYS = new Set(['action', 'actions']);
const META_COLUMN_KEYS = new Set(['expand']);
const STATUS_COLUMN_KEYS = new Set(['status']);
const AMOUNT_COLUMN_KEYS = new Set([
  'amount',
  'balance',
  'total',
  'totalAmount',
  'sellingPrice',
  'purchasePrice',
]);

const isActionColumn = col =>
  ACTION_COLUMN_KEYS.has(col.key) ||
  (col.label === '' && col.key !== 'expand' && Boolean(col.renderCell));

const isMetaColumn = col =>
  isActionColumn(col) || META_COLUMN_KEYS.has(col.key) || (col.label === '' && col.key === 'expand');

const getColumnLabel = col => {
  if (typeof col.label === 'string' && col.label.trim()) {
    return col.label;
  }

  return col.mobileLabel || '';
};

const renderColumnCell = (col, row, rowIdx, renderCell) => {
  if (col.renderCell) {
    return col.renderCell(row, rowIdx);
  }

  if (renderCell) {
    return renderCell(row, col, rowIdx);
  }

  return row[col.key] ?? '';
};

const normalizeColumnText = value =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '');

const isStatusColumn = col => {
  const key = normalizeColumnText(col.key);
  const label = normalizeColumnText(getColumnLabel(col));

  return STATUS_COLUMN_KEYS.has(key) || label.includes('status');
};

const isAmountColumn = col => {
  const key = normalizeColumnText(col.key);
  const label = normalizeColumnText(getColumnLabel(col));

  return (
    AMOUNT_COLUMN_KEYS.has(key) ||
    label.includes('amount') ||
    label.includes('balance') ||
    label.includes('price') ||
    label.includes('total')
  );
};

const cellContentSx = {
  minWidth: 0,
  '& .MuiTypography-root': {
    maxWidth: '100%',
    whiteSpace: 'normal !important',
    overflowWrap: 'anywhere',
  },
  '& a': {
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },
};

const compactValueSx = {
  ...cellContentSx,
  display: 'flex',
  justifyContent: 'flex-end',
  textAlign: 'end',
  '& .MuiTypography-root': {
    ...cellContentSx['& .MuiTypography-root'],
    textAlign: 'end !important',
  },
};

const CustomListTableMobileCards = ({
  columns = [],
  rows = [],
  rowKey,
  renderCell,
  emptyContent,
  noDataText = 'No data found.',
  onRowClick,
  enableHover = true,
  getRowClassName,
  selectedRows = [],
  onRowSelect,
  expandedRows = {},
  expandableRowRender,
  interactiveSelector,
}) => {
  const theme = useTheme();

  if (!rows.length) {
    return (
      <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {emptyContent || noDataText}
        </Typography>
      </Box>
    );
  }

  const actionColumns = columns.filter(isActionColumn);
  const metaColumns = columns.filter(col => META_COLUMN_KEYS.has(col.key));
  const dataColumns = columns.filter(col => !isMetaColumn(col));
  const primaryColumn = dataColumns[0];
  const secondaryColumns = dataColumns.slice(1);
  const statusColumn = secondaryColumns.find(isStatusColumn);
  const amountColumn = secondaryColumns.find(isAmountColumn);
  const titleColumn = secondaryColumns.find(col => col !== statusColumn && col !== amountColumn);
  const supportingColumns = secondaryColumns.filter(
    col => col !== titleColumn && col !== statusColumn && col !== amountColumn
  );

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {rows.map((row, rowIdx) => {
        const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
        const rowId = row._id || key;
        const isExpanded = expandedRows?.[rowId];
        const isSelected = selectedRows.includes(key);
        const shouldHover = Boolean(onRowClick || enableHover);

        return (
          <Box
            key={key}
            className={getRowClassName ? getRowClassName(row, rowIdx) : ''}
            onClick={event => {
              if (!onRowClick) return;
              const target = event?.target;
              if (target?.closest?.(interactiveSelector)) return;
              onRowClick(row, rowIdx, event);
            }}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              borderRadius: 2.5,
              p: 1.5,
              bgcolor: isExpanded ? theme.palette.secondary.lightestOpacity : 'background.paper',
              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.06)}`,
              transition: 'background-color 200ms ease',
              ...(shouldHover && onRowClick && {
                cursor: 'pointer',
                '&:active': { bgcolor: 'action.hover' },
              }),
              ...(isSelected && {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {onRowSelect ? (
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={event => {
                    event.stopPropagation();
                    if (event.target.checked) {
                      onRowSelect([...selectedRows, key]);
                    } else {
                      onRowSelect(selectedRows.filter(id => id !== key));
                    }
                  }}
                  inputProps={{ 'aria-label': `select row ${rowIdx + 1}` }}
                  sx={{ ml: -0.5 }}
                />
              ) : null}

              {primaryColumn ? (
                <Box
                  sx={{
                    ...cellContentSx,
                    flex: 1,
                    fontWeight: 700,
                    '& .MuiTypography-root': {
                      ...cellContentSx['& .MuiTypography-root'],
                      textAlign: 'start !important',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    },
                  }}
                >
                  {renderColumnCell(primaryColumn, row, rowIdx, renderCell)}
                </Box>
              ) : null}

              {metaColumns.map(col => (
                <Box key={col.key} sx={{ flexShrink: 0 }} onClick={event => event.stopPropagation()}>
                  {renderColumnCell(col, row, rowIdx, renderCell)}
                </Box>
              ))}

              {actionColumns.map(col => (
                <Box key={col.key} sx={{ flexShrink: 0 }} onClick={event => event.stopPropagation()}>
                  {renderColumnCell(col, row, rowIdx, renderCell)}
                </Box>
              ))}
            </Box>

            {titleColumn || amountColumn || statusColumn ? (
              <Box
                sx={{
                  mt: 1.25,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: 1.5,
                  alignItems: 'start',
                }}
              >
                <Box
                  sx={{
                    ...cellContentSx,
                    color: 'text.primary',
                    '& .MuiTypography-root': {
                      ...cellContentSx['& .MuiTypography-root'],
                      textAlign: 'start !important',
                      fontSize: '0.95rem',
                    },
                  }}
                >
                  {titleColumn ? renderColumnCell(titleColumn, row, rowIdx, renderCell) : null}
                </Box>

                <Stack spacing={0.75} alignItems="flex-end" sx={{ minWidth: 88 }}>
                  {amountColumn ? (
                    <Box sx={compactValueSx}>
                      {renderColumnCell(amountColumn, row, rowIdx, renderCell)}
                    </Box>
                  ) : null}
                  {statusColumn ? (
                    <Box sx={compactValueSx}>
                      {renderColumnCell(statusColumn, row, rowIdx, renderCell)}
                    </Box>
                  ) : null}
                </Stack>
              </Box>
            ) : null}

            {supportingColumns.length > 0 ? (
              <Box
                sx={{
                  mt: 1.25,
                  pt: 1.25,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  display: 'grid',
                  gap: 0.75,
                }}
              >
                {supportingColumns.map(col => {
                  const label = getColumnLabel(col);

                  return (
                    <Box
                      key={col.key}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: label ? '96px minmax(0, 1fr)' : '1fr',
                        alignItems: 'start',
                        gap: 1,
                      }}
                    >
                      {label ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}
                        >
                          {label}
                        </Typography>
                      ) : null}
                      <Box sx={{ ...cellContentSx, textAlign: label ? 'end' : 'start' }}>
                        {renderColumnCell(col, row, rowIdx, renderCell)}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : null}

            {expandableRowRender && isExpanded ? (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
                {expandableRowRender(row, rowIdx)}
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
};

export const filterColumnsForViewport = (columns, { isMobile, isTablet }) =>
  columns.filter(col => {
    if (col.hideBelow === 'md' && isTablet) return false;
    if (col.hideBelow === 'sm' && isMobile) return false;
    return true;
  });

export default CustomListTableMobileCards;
