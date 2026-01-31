import { Typography, IconButton, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import Chip from '@/components/custom-components/CustomChip';

/**
 * Branch-centric inventory table column definitions
 */
export const getBranchInventoryColumns = () => [
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
        <Tooltip title={isExpanded ? 'Collapse' : 'Expand inventory'}>
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
      <Typography variant="body1" color="text.primary" className="text-[0.9rem]">
        {rowIndex + 1}
      </Typography>
    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Distribution',
    sortable: true,
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem]">
        {row.name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'branchType',
    visible: true,
    label: 'Type',
    sortable: false,
    align: 'center',
    renderCell: (row) => (
      <Chip
        size="small"
        label={row.branchType || '-'}
        color={row.branchType === 'Store' ? 'primary' : 'secondary'}
        variant="outlined"
        sx={{ fontSize: '0.75rem' }}
      />
    ),
  },
  {
    key: 'province',
    visible: true,
    label: 'Province',
    sortable: true,
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.province || '-'}
      </Typography>
    ),
  },
  {
    key: 'city',
    visible: true,
    label: 'City',
    sortable: true,
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.city || '-'}
      </Typography>
    ),
  },
  {
    key: 'district',
    visible: true,
    label: 'District',
    sortable: false,
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.district || '-'}
      </Typography>
    ),
  },
  {
    key: 'totalItems',
    visible: true,
    label: 'Items',
    sortable: false,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] font-medium">
        {row.totalItems ?? row.inventoryItems?.length ?? 0}
      </Typography>
    ),
  },
  {
    key: 'totalQuantity',
    visible: true,
    label: 'Quantity',
    sortable: false,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] font-medium">
        {row.totalQuantity ?? 0}
      </Typography>
    ),
  },
];
