'use client';

import React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { RiyalIcon } from '@/utils/currencyUtils';

const formatMovementLabel = (value = '') =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');

const formatLocationText = (location = {}) =>
  [location?.province, location?.city, location?.district].filter(Boolean).join(' · ');

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EXTERNAL_ENDPOINTS = {
  PURCHASE_IN: { label: 'Vendor', icon: 'mdi:truck-delivery-outline' },
  SALES_RETURN_IN: { label: 'Customer Return', icon: 'mdi:keyboard-return' },
  ADJUSTMENT_IN: { label: 'Stock Adjustment', icon: 'mdi:tune-variant' },
  OPENING_BALANCE: { label: 'Opening Stock', icon: 'mdi:package-variant' },
  SALE_OUT: { label: 'Customer', icon: 'mdi:cart-outline' },
  PURCHASE_RETURN_OUT: { label: 'Vendor Return', icon: 'mdi:package-variant-closed-remove' },
  ADJUSTMENT_OUT: { label: 'Stock Adjustment', icon: 'mdi:tune-variant' },
};

const isTransferMovement = (row = {}) =>
  row?.sourceType === 'INVENTORY_TRANSFER' &&
  ['TRANSFER_IN', 'TRANSFER_OUT'].includes(row?.movementType);

const isManualStockAdjustment = (row = {}) =>
  row?.sourceType === 'INVENTORY_MANUAL_STOCK' &&
  ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(row?.movementType);

const isInboundMovement = (movementType = '') =>
  /(_IN|OPENING_BALANCE)$/.test(String(movementType).toUpperCase());

const buildBranchNode = (location = {}) => ({
  kind: 'branch',
  label: location?.branchName || location?.branchCode || 'Branch',
  sublabel: location?.branchCode || '',
  detail: formatLocationText(location),
  icon: String(location?.branchType || '').toLowerCase() === 'warehouse'
    ? 'mdi:warehouse'
    : 'mdi:storefront-outline',
});

const buildExternalNode = (movementType = '') => {
  const endpoint = EXTERNAL_ENDPOINTS[movementType] || {
    label: 'External',
    icon: 'mdi:circle-outline',
  };
  return { kind: 'external', label: endpoint.label, sublabel: '', detail: '', icon: endpoint.icon };
};

const getLocationId = (location = {}) => String(location?.branchId || '').trim();

const buildMovementEndpoints = (row = {}, historyBranchId = '') => {
  const normalizedHistoryBranchId = String(historyBranchId || '').trim();

  if (isTransferMovement(row)) {
    const sourceNode = buildBranchNode(row.sourceLocation);
    const destinationNode = buildBranchNode(row.destinationLocation);
    const selectedIsDestination =
      normalizedHistoryBranchId &&
      getLocationId(row.destinationLocation) === normalizedHistoryBranchId;

    return {
      leftNode: selectedIsDestination ? destinationNode : sourceNode,
      rightNode: selectedIsDestination ? sourceNode : destinationNode,
      direction: selectedIsDestination ? 'left' : 'right',
      movementLabel: selectedIsDestination ? 'Transfer In' : 'Transfer Out',
      colorMovementType: selectedIsDestination ? 'TRANSFER_IN' : 'TRANSFER_OUT',
    };
  }

  const branchNode = buildBranchNode(row.branchLocation);
  if (isManualStockAdjustment(row)) {
    const isAddStock = row.movementType === 'ADJUSTMENT_IN';

    return {
      leftNode: branchNode,
      rightNode: null,
      symbol: isAddStock ? 'plus' : 'minus',
      movementLabel: isAddStock ? 'Add Stock' : 'Remove Stock',
      colorMovementType: row.movementType,
    };
  }

  const externalNode = buildExternalNode(row.movementType);
  const inbound = isInboundMovement(row.movementType);

  return {
    leftNode: branchNode,
    rightNode: externalNode,
    direction: inbound ? 'left' : 'right',
    movementLabel: formatMovementLabel(row.movementType),
    colorMovementType: row.movementType,
  };
};

const useMovementColor = () => {
  const theme = useTheme();
  return (movementType) => {
    const upper = String(movementType || '').toUpperCase();
    if (upper === 'TRANSFER_IN') return theme.palette.primary.dark;
    if (upper === 'TRANSFER_OUT') return theme.palette.info.dark;
    if (upper === 'ADJUSTMENT_IN') return theme.palette.success.dark;
    if (upper === 'ADJUSTMENT_OUT') return theme.palette.error.dark;
    if (/(_IN|OPENING_BALANCE)$/.test(upper)) return theme.palette.success.main;
    if (/_OUT$/.test(upper)) return theme.palette.error.main;
    return theme.palette.grey[600];
  };
};

const MovementNode = ({ node, color, align = 'left' }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        // bgcolor: alpha(color, 0.12),
        color,
        // border: `1px solid ${alpha(color, 0.35)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon icon={node.icon} width={24} />
    </Box>
    <Box sx={{ minWidth: 0, textAlign: align }}>
      <Typography
        variant='body2'
        sx={{ fontWeight: 600, lineHeight: 1.2 }}
        noWrap
        title={node.label}
      >
        {node.label}
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', lineHeight: 1.2 }}
        noWrap
        title={node.detail || node.sublabel}
      >
        {node.detail || node.sublabel || (node.kind === 'external' ? 'External party' : '—')}
      </Typography>
    </Box>
  </Box>
);

const MovementConnector = ({ quantity, label, color, direction = 'right' }) => (
  <Box
    sx={{
      flex: '0 0 auto',
      width: { xs: 120, sm: 160 },
      height: 40,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mx: { xs: 1, sm: 1.5 },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        left: direction === 'left' ? 10 : 0,
        right: direction === 'left' ? 0 : 10,
        top: '50%',
        borderTop: `3px dashed ${alpha(color, 0.5)}`,
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        ...(direction === 'left' ? { left: 0 } : { right: 0 }),
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        ...(direction === 'left'
          ? { borderRight: `8px solid ${color}` }
          : { borderLeft: `8px solid ${color}` }),
      }}
    />
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        px: 1.3,
        py: 0.25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1.1,
      }}
    >
      <Typography
        variant='caption'
        sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.1 }}
      >
        {`${Number(quantity || 0)} ${Number(quantity || 0) === 1 ? 'unit' : 'units'}`}
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ lineHeight: 1.3, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.07em' }}

        noWrap
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const StockAdjustmentSymbol = ({ quantity, label, color, symbol }) => {
  const numericQuantity = Number(quantity || 0);
  const unitsLabel = `${numericQuantity} ${numericQuantity === 1 ? 'unit' : 'units'}`;
  const NODE_SIZE = 20;

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        width: { xs: 120, sm: 160 },
        height: 40,
        position: 'relative',
        mx: { xs: 1, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          width: '38%',
          top: '50%',
          borderTop: `2px dashed ${alpha(color, 0.5)}`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: `calc(38% - ${NODE_SIZE / 2}px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: '50%',
          bgcolor: color,
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 0 3px ${alpha(color, 0.15)}`,
        }}
      >
        <Icon icon={symbol === 'plus' ? 'mdi:plus' : 'mdi:minus'} width={14} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: `calc(38% + ${NODE_SIZE / 2 + 6}px)`,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.1,
        }}
      >
        <Typography
          variant='caption'
          sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.1 }}
          noWrap
        >
          {unitsLabel}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            lineHeight: 1.2,
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
          }}
          noWrap
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const DateCell = ({ value }) => (
  <Box sx={{ minWidth: 82 }}>
    <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
      {formatDate(value)}
    </Typography>
    <Typography
      variant='caption'
      color='text.secondary'
      sx={{ lineHeight: 1.2, display: 'block' }}
    >
      {formatTime(value)}
    </Typography>
  </Box>
);

const AmountCell = ({ value, strong = false }) => (
  <Box className='flex items-center justify-end gap-1'>
    <RiyalIcon width={11} />
    <Typography
      variant='body2'
      color={'text.secondary'}
      sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: '0.9rem' }}
    >
      {formatAmount(value)}
    </Typography>
  </Box >
);

const MovementDiagram = ({ row, historyBranchId }) => {
  const getColor = useMovementColor();
  const {
    leftNode,
    rightNode,
    direction,
    movementLabel,
    symbol,
    colorMovementType,
  } = buildMovementEndpoints(row, historyBranchId);
  const color = getColor(colorMovementType);

  return (
    <Box
      sx={{
        position: 'relative',
        pl: 1.75,
        py: 0.25,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <MovementNode node={leftNode} color={color} />
          {symbol ? (
            <StockAdjustmentSymbol
              quantity={row.quantity}
              label={movementLabel}
              color={color}
              symbol={symbol}
            />
          ) : (
            <MovementConnector
              quantity={row.quantity}
              label={movementLabel}
              color={color}
              direction={direction}
            />
          )}
          {rightNode ? (
            <MovementNode node={rightNode} color={color} align='right' />
          ) : (
            <Box sx={{ flex: 1, minWidth: 0 }} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

const InventoryMovementDialog = ({
  open,
  onClose,
  rows = [],
  loading = false,
  historyBranchId = '',
  title = 'Movement History',
  subtitle = '',
}) => (
  <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
    <DialogTitle sx={{ pb: 1 }}>
      <Box className='flex items-center gap-2'>
        <Icon icon='mdi:timeline-clock-outline' width={22} />
        <Box>
          <Typography variant='h6'>{title}</Typography>
          {subtitle ? (
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </DialogTitle>

    <DialogContent>
      {loading ? (
        <Box className='flex items-center justify-center py-10 gap-3'>
          <CircularProgress size={24} />
          <Typography variant='body2' color='text.secondary'>
            Loading movement history...
          </Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box className='flex flex-col items-center justify-center py-10 gap-2 text-center'>
          <Icon icon='mdi:timeline-remove-outline' width={36} />
          <Typography variant='subtitle1'>No movement history found</Typography>
          <Typography variant='body2' color='text.secondary'>
            Transfers, cycle counts, and other costing movements will appear here.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant='outlined' sx={{ mt: 0.5 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Date</TableCell>
                <TableCell>Movement</TableCell>
                <TableCell align='right' sx={{ width: 120 }}>Unit Cost</TableCell>
                <TableCell align='right' sx={{ width: 120 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const movementDate = row.movementDate || row.createdAt;

                return (
                  <TableRow key={row._id || `${row.movementType}-${row.movementDate}`}>
                    <TableCell sx={{ verticalAlign: 'middle' }}>
                      <DateCell value={movementDate} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 520, verticalAlign: 'middle' }}>
                      <MovementDiagram row={row} historyBranchId={historyBranchId} />
                    </TableCell>
                    <TableCell align='right' sx={{ verticalAlign: 'middle' }}>
                      <AmountCell value={row.unitCost} />
                    </TableCell>
                    <TableCell align='right' sx={{ verticalAlign: 'middle' }}>
                      <AmountCell value={row.totalCost} strong />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} color='secondary'>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default InventoryMovementDialog;
