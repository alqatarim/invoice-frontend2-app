'use client'

import React from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import { Icon } from '@iconify/react'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/currencyUtils'
import { paymentSummaryStatus, paymentMethodIcons } from '@/data/dataSets'

const getPaymentModeIcon = (mode) => {
  const found = paymentMethodIcons.find(icon => icon.value === mode)
  return found ? found.label : 'bi:credit-card'
}

const PaymentSummaryColumns = ({ handleView, handleDelete, handleStatusUpdate }) => {
  const theme = useTheme()

  return [
    {
      key: 'index',
      label: '#',
      visible: true,
      sortable: false,
      renderCell: (row, index) => (
        <Typography variant="body1">{index + 1}</Typography>
      ),
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography
          component={Link}
          href={`/invoices/invoice-view/${row.invoiceId}`}
          variant="h6"
          color="primary"
          sx={{ textDecoration: 'none' }}s
        >
          {row.invoiceNumber || '-'}
        </Typography>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      visible: true,
      sortable: true,
      renderCell: (row) => {
        const customer = row.customerDetail
        if (!customer) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, width: 34, height: 34 }}>
                <Icon icon="mdi:image-off-outline" />
              </Avatar>
              <Box>
                <Typography variant="h6">Deleted Customer</Typography>
                <Typography variant="caption" display="block">Deleted Customer</Typography>
              </Box>
            </Box>
          )
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={customer.image}
              alt={customer.name}
              sx={{ mr: 2, width: 34, height: 34 }}
            >
              {!customer.image && <Icon icon="mdi:image-off-outline" />}
            </Avatar>
            <Box>
              <Typography
                color="primary.main"
                variant="h6"
                component={Link}
                href={`/customers/customer-view/${customer._id}`}
                sx={{ textDecoration: 'none' }}
              >
                {customer.name || 'Unknown'}
              </Typography>
              <Typography variant="caption" display="block">
                {customer.phone || '-'}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography variant="body1">{formatCurrency(row.amount)}</Typography>
      ),
    },
    {
      key: 'date',
      label: 'Payment Date',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography variant="body1">{formatDate(row.createdAt)}</Typography>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon
            icon={getPaymentModeIcon(row.payment_method)}
            fontSize={23}
            color={theme.palette.secondary.main}
          />
          <Typography variant="body1">{row.payment_method || '-'}</Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      sortable: true,
      renderCell: (row) => {
        const statusOption = paymentSummaryStatus.find(option => option.value === row.status)
        return (
          <Chip
            color={statusOption?.color || 'secondary'}
            variant="tonal"
            size="medium"
            label={statusOption?.label || row.status}
          />
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      visible: true,
      sortable: false,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleView(row.invoiceId)}
            title="View Payment"
          >
            <Icon icon="line-md:watch" />
          </IconButton>
        </Box>
      ),
    },
  ]
}

export default PaymentSummaryColumns