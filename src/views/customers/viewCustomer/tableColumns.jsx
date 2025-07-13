// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'

// Icon Imports
import { Icon } from '@iconify/react'

// Utils Imports
import { formatCurrency } from '@/utils/currencyUtils'
import moment from 'moment'

export const getCustomerInvoiceColumns = (getStatusColor, getStatusLabel, theme) => [
  {
    key: 'invoiceNumber',
    label: 'Invoice #',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography
        color='text.primary'
        component={Link}
        href={`/invoices/invoice-view/${row._id}`}
        className=' text-primary text-[0.9rem] hover:underline'
      >
        {row.invoiceNumber || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'invoiceDate',
    label: 'Date',
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography
      color='text.primary'
      className=' text-primary text-[0.9rem]'
      >
        {moment(row.invoiceDate).format('MMM DD, YYYY')}
      </Typography>
    )
  },
  {
    key: 'amounts',
    label: 'Amount',
    sortable: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;
      const paid = Number(row.paidAmount) || 0;
      const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

      return (
        <div className="flex flex-col min-w-[130px] w-full">
          <div className="flex flex-row justify-between items-center mb-0.5 w-full">
            <Typography color="text.primary" className='text-[0.9rem]'>{paid}</Typography>
            <div className="flex items-center gap-1 min-w-[48px] justify-end">
              <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
              <Typography color="text.primary" className='text-[0.9rem] font-medium'>{total}</Typography>
            </div>
          </div>
          <div className="flex-1 w-full">
            <LinearProgress variant="determinate" color='info' value={percentPaid} />
          </div>
        </div>
      );
    }
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    renderCell: (row) => (
      <Chip
        label={getStatusLabel(row.status)}
        size='small'
        color={getStatusColor(row.status)}
        variant='tonal'
        className='font-medium'
      />
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
    renderCell: (row) => (
      <IconButton
        size='small'
        component={Link}
        href={`/invoices/invoice-view/${row._id}`}
        className='text-primary'
      >
        <i className='ri-eye-line' />
      </IconButton>
    )
  }
]
