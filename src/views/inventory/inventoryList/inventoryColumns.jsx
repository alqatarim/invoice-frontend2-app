import { Typography, Box, IconButton, Tooltip, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButtonTwo from '@core/components/mui/CustomIconButton';

const getSelectedBranchStock = (row, selectedBranchId = '') => {
  const branches = row?.inventory_Info?.[0]?.branches || [];
  const branchStock = selectedBranchId
    ? branches.find((branch) => String(branch?.branchId || '') === String(selectedBranchId))
    : null;

  return {
    branches,
    branchStock,
    quantity: selectedBranchId
      ? Math.max(0, Number(branchStock?.quantity || 0))
      : (row.inventory_Info?.[0]?.quantity || 0),
  };
};

const buildSelectedBranchRow = (row, selectedBranch = {}, selectedBranchId = '') => {
  const inventoryInfo = row?.inventory_Info?.[0] || {};
  const { branchStock, quantity } = getSelectedBranchStock(row, selectedBranchId);

  return {
    rowType: 'branch',
    branchId: selectedBranchId,
    branchName: selectedBranch?.name || branchStock?.branchName || '',
    branchType: selectedBranch?.branchType || branchStock?.branchType || '',
    province: selectedBranch?.province || branchStock?.province || '',
    city: selectedBranch?.city || branchStock?.city || '',
    district: selectedBranch?.district || branchStock?.district || '',
    quantity,
    parentItem: {
      _id: row?._id,
      name: row?.name,
      sku: row?.sku,
      sellingPrice: row?.sellingPrice,
      purchasePrice: row?.purchasePrice,
      inventory_Info: [inventoryInfo],
    },
  };
};

/**
 * Inventory table column definitions - Main table only
 * Branch-specific columns are rendered in the expanded sub-table
 */
export const getInventoryColumns = ({ theme, selectedBranch = null, selectedBranchId = '' }) => {
  return [
    {
      key: 'expand',
      visible: true,
      label: '',
      sortable: false,
      align: 'center',
      width: '50px',
      renderCell: (row, rowIndex, handlers) => {
        const isExpanded = handlers?.expandedRows?.[row._id];
        return (
          <Tooltip title={isExpanded ? 'Collapse' : 'Expand branches'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handlers?.toggleRow?.(row._id);
              }}
            >
              <Icon
                icon="mdi:chevron-down"
                width={22}
                style={{
                  transition: 'transform 200ms ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </IconButton>
          </Tooltip>
        );
      },
    },
    {
      key: 'index',
      visible: true,
      label: '#',
      sortable: false,
      align: 'center',
      width: '50px',
      renderCell: (row, rowIndex) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
          {rowIndex + 1}
        </Typography>
      ),
    },
    {
      key: 'name',
      visible: true,
      label: 'Item',
      sortable: true,
      align: 'left',
      renderCell: (row) => (
        <Typography
          variant="body1"
          className="text-[0.9rem] text-start"
          color='text.primary'
        >
          {row.name || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'sku',
      visible: true,
      label: 'SKU',
      sortable: true,
      align: 'left',
      renderCell: (row) => (
        <Box className='flex items-start gap-1'>
          <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
            {row.sku || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'units',
      visible: true,
      label: 'Units',
      sortable: false,
      align: 'center',
      renderCell: (row) => (
        <Box className='flex items-center justify-center gap-1'>
          <Chip
            size="small"
            label={row.unitInfo?.[0]?.name || 'N/A'}
            color="secondary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      ),
    },
    {
      key: 'sellingPrice',
      visible: true,
      label: 'Sales Price',
      sortable: true,
      align: 'left',
      renderCell: (row) => (
        <div className="flex items-center justify-start gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            color={theme.palette.secondary.light}
          />
          <Typography
            color="text.primary"
            className='text-[0.9rem] font-medium'
          >
            {row.sellingPrice?.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}
          </Typography>
        </div>
      ),
    },
    {
      key: 'purchasePrice',
      visible: true,
      label: 'Purchase Price',
      sortable: true,
      align: 'left',
      renderCell: (row) => (
        <div className="flex items-center justify-start gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            color={theme.palette.secondary.light}
          />
          <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
            {row.purchasePrice?.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}
          </Typography>
        </div>
      ),
    },
    {
      key: 'quantity',
      visible: true,
      label: 'Qty',
      sortable: true,
      align: 'center',
      renderCell: (row) => {
        const { quantity } = getSelectedBranchStock(row, selectedBranchId);

        return (
          <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
            {quantity}
          </Typography>
        );
      },
    },
    {
      key: 'actions',
      visible: true,
      label: '',
      sortable: false,
      align: 'center',
      width: '120px',
      renderCell: (row, rowIndex, handlers) => {
        if (!handlers?.permissions?.canUpdate) return null;

        const isAnyLoading = Boolean(
          handlers?.stockLoading?.addStock ||
          handlers?.stockLoading?.removeStock ||
          handlers?.stockLoading?.transferStock ||
          handlers?.stockLoading?.cycleCount
        );
        const hasSelectedBranch = Boolean(selectedBranchId);
        const { quantity } = getSelectedBranchStock(row, selectedBranchId);
        const branchRow = buildSelectedBranchRow(row, selectedBranch, selectedBranchId);

        const openStockDialog = (event, type) => {
          event.stopPropagation();
          if (!hasSelectedBranch) return;
          handlers?.openStockDialog?.(type, branchRow, event.currentTarget);
        };

        return (
          <Box className="flex items-center justify-center gap-1" onClick={(event) => event.stopPropagation()}>
            <Tooltip title={hasSelectedBranch ? 'Add Stock' : 'Choose a branch from the top bar'} arrow>
              <span>
                <CustomIconButtonTwo
                  size="small"
                  // variant="tonal"
                  skin="light"
                  color="success"
                  onClick={(event) => openStockDialog(event, 'add')}
                  disabled={isAnyLoading || !hasSelectedBranch}
                >
                  <Icon icon="mdi:plus" width={18} />
                </CustomIconButtonTwo>
              </span>
            </Tooltip>
            <Tooltip
              title={
                !hasSelectedBranch
                  ? 'Choose a branch from the top bar'
                  : quantity > 0
                    ? 'Remove Stock'
                    : 'No stock in selected branch'
              }
              arrow
            >
              <span>
                <CustomIconButtonTwo
                  size="small"
                  skin="light"
                  color="error"
                  onClick={(event) => openStockDialog(event, 'remove')}
                  disabled={isAnyLoading || !hasSelectedBranch || quantity <= 0}
                >
                  <Icon icon="mdi:minus" width={18} color={theme.palette.error.main} />
                </CustomIconButtonTwo>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];
};
