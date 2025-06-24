import { Typography, ButtonGroup, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { amountFormat } from '@/utils/numberUtils';

/**
 * Inventory table column definitions
 */
export const getInventoryColumns = ({ permissions }) => [
  {
    key: 'index',
    visible: true,
    label: '#',
    sortable: false,
    align: 'center',
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
        className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline'
      >
        {row.name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'sku',
    visible: true,
    label: 'Code',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.sku || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'units',
    visible: true,
    label: 'Units',
    sortable: false,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.unitInfo?.[0]?.name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'quantity',
    visible: true,
    label: 'Quantity',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
        {row.inventory_Info?.[0]?.quantity || 0}
      </Typography>
    ),
  },
  {
    key: 'sellingPrice',
    visible: true,
    label: 'Sales Price',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        ${amountFormat(row.sellingPrice)}
      </Typography>
    ),
  },
  {
    key: 'purchasePrice',
    visible: true,
    label: 'Purchase Price',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        ${amountFormat(row.purchasePrice)}
      </Typography>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    visible: true,
    align: 'center',
    renderCell: (row, rowIndex, handlers) => {
      if (!permissions.canUpdate) return null;

      return (
        <ButtonGroup
          variant='outlined'
          color='secondary'
          size="small"
        >
          <Button
            onClick={() => handlers?.openStockDialog?.('add', row)}
            title="Add Stock"
          >
            <AddIcon color='success' />
          </Button>
          <Button
            onClick={() => handlers?.openStockDialog?.('remove', row)}
            title="Remove Stock"
          >
            <RemoveIcon color='error' className='size-5' />
          </Button>
        </ButtonGroup>
      );
    },
  },
];