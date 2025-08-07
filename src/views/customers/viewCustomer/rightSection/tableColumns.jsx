// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import { Box } from '@mui/material'
import { Grid } from '@mui/material'

// Icon Imports
import { Icon } from '@iconify/react'

// Utils Imports
import { formatDate } from '@/utils/dateUtils'
import { actionButtons } from '@/data/dataSets'
import { statusOptions } from '@/data/dataSets'
import { useTheme } from '@mui/material/styles'

// Memoized action buttons lookup for better performance
const actionButtonsMap = new Map(actionButtons.map(button => [button.id, button]))
const statusOptionsMap = new Map(statusOptions.map(option => [option.value, option]))

export const getCustomerInvoiceColumns = () => [
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
        className=' text-primary text-[0.9rem] hover:underline font-semibold
        '
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
      // color='text.primary'
      color={useTheme().palette.primary.lightest}
      className='text-[0.9rem]'
      >
        {formatDate(row.invoiceDate)}
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
  



        <Grid container className="flex flex-row gap-1 min-w-[140px] items-center">
          
                <Grid size={{md: 'auto'}} className='text-start'> 
              <Typography color="text.secondary" className='text-[0.9rem]'>{paid}</Typography>
              </Grid>
             
         
              <Grid size={{md:6}} >
              <LinearProgress  variant="determinate" color='info' value={percentPaid} />
              </Grid>
         
              <Grid size={{ md:'auto'}} className="flex items-center gap-1 min-w-[48px] justify-start">
              <Icon icon="lucide:saudi-riyal" width="1.0rem" color={ useTheme().palette.secondary.light} />
            <Typography color="text.primary" className='text-[0.9rem] font-medium'>{total}</Typography>
            </Grid>

        </Grid>


      );
    }
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    renderCell: (row) => {
      const statusOption = statusOptionsMap.get(row.status) || {};
      return (
        <Chip
          label={statusOption.label || row.status || 'Unpaid'}
          size='small'
          color={statusOption.color || 'default'}
          variant='tonal'
          className='font-medium'
        />
      );
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
    renderCell: (row) => {
      
      return (
        <Box className='flex gap-1 items-center justify-center'>
        <IconButton
          size='small'
          component={Link}
          href={`/invoices/invoice-view/${row._id}`}
          title={actionButtonsMap.get('view')?.title}
          // className='text-primary'
        >
          <Icon icon={actionButtonsMap.get('view')?.icon} />
        </IconButton>

        <IconButton
          size='small'
          component={Link}
          href={`/invoices/edit/${row._id}`}
          title={actionButtonsMap.get('edit')?.title}
          // className='text-primary'
        >
          <Icon icon={actionButtonsMap.get('edit')?.icon} />
        </IconButton>


        </Box>
      );
    }
  }
]
