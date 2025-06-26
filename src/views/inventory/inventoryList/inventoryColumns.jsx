import { Typography, ButtonGroup, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import CustomButton from '@core/components/mui/CustomIconButton';
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
        className='text-[0.9rem] text-start'
        color='text.primary'
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
    key: 'stock',
    label: 'Stock',
    visible: true,
    align: 'center',
    renderCell: (row, rowIndex, handlers) => {
      if (!permissions.canUpdate) return null;

      const isLoadingAdd = handlers?.stockLoading?.addStock;
      const isLoadingRemove = handlers?.stockLoading?.removeStock;
      const isAnyLoading = isLoadingAdd || isLoadingRemove;

      return (
        <ButtonGroup
          variant='outlined'
          color='secondary'
          size="small"
        >
          <CustomButton
            skin='light'
            color='success'
            onClick={(e) => handlers?.openStockDialog?.('add', row, e.currentTarget)}
            title="Add Stock"
            disabled={isAnyLoading}
          >
            <AddIcon color={isAnyLoading ? 'disabled' : 'success'} />
          </CustomButton>
          <CustomButton
            skin='light'
            color='error'
            onClick={(e) => handlers?.openStockDialog?.('remove', row, e.currentTarget)}
            title="Remove Stock"
            disabled={isAnyLoading}
          >
            <RemoveIcon color={isAnyLoading ? 'disabled' : 'error'} className='size-5' />
          </CustomButton>
        </ButtonGroup>
      );
    },
  },
];