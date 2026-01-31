import { Typography, Box, IconButton, Tooltip, Chip } from '@mui/material';
import { amountFormat } from '@/utils/numberUtils';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';

/**
 * Inventory table column definitions - Main table only
 * Branch-specific columns are rendered in the expanded sub-table
 */
export const getInventoryColumns = ({ permissions }) => {
  const theme = useTheme();
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
      label: 'Quantity',
      sortable: true,
      align: 'center',
      renderCell: (row) => {
        const branches = row?.inventory_Info?.[0]?.branches || [];
        const total = branches.length
          ? branches.reduce((sum, branch) => sum + Math.max(0, Number(branch?.quantity || 0)), 0)
          : (row.inventory_Info?.[0]?.quantity || 0);

        return (
          <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
            {total}
          </Typography>
        );
      },
    },
  ];
};

/**
 * Branch sub-table column definitions - Used in the expanded section
 */
export const getBranchColumns = ({ permissions, handlers, theme }) => [
  {
    key: 'branchName',
    label: 'Branch',
    width: '18%',
    align: 'left',
    renderCell: (branch, index) => (
      <Typography variant="body2" color="text.primary">
        {branch.branchName || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'branchType',
    label: 'Type',
    width: '10%',
    align: 'center',
    renderCell: (branch) => (
      <Typography variant="body2" color="text.secondary">
        {branch.branchType || '-'}
      </Typography>
    ),
  },
  {
    key: 'province',
    label: 'Province',
    width: '15%',
    align: 'left',
    renderCell: (branch) => (
      <Typography variant="body2" color="text.secondary">
        {branch.province || '-'}
      </Typography>
    ),
  },
  {
    key: 'city',
    label: 'City',
    width: '15%',
    align: 'left',
    renderCell: (branch) => (
      <Typography variant="body2" color="text.secondary">
        {branch.city || '-'}
      </Typography>
    ),
  },
  {
    key: 'district',
    label: 'District',
    width: '12%',
    align: 'left',
    renderCell: (branch) => (
      <Typography variant="body2" color="text.secondary">
        {branch.district || '-'}
      </Typography>
    ),
  },
  {
    key: 'quantity',
    label: 'Quantity',
    width: '10%',
    align: 'center',
    renderCell: (branch) => (
      <Typography variant="body1" color="text.primary" className="font-medium">
        {branch.quantity || 0}
      </Typography>
    ),
  },
];
