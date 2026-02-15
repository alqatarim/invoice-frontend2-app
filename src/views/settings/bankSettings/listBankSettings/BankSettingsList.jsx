'use client'

import { useState, useMemo } from 'react'
import { 
  Alert, 
  Box, 
  CircularProgress,
  Chip
} from '@mui/material'
import { Edit, Visibility, Delete, MoreVert } from '@mui/icons-material'
import Link from 'next/link'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { formatDate } from '@/utils/dateUtils'
import OptionMenu from '@core/components/option-menu'

const BankSettingsList = ({ 
  banks = [], 
  pagination = {}, 
  loading = false, 
  deleting = false,
  error = null, 
  onRefresh, 
  onDelete,
  onClearError 
}) => {
  const [selectedRows, setSelectedRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const columns = [
    {
      key: 'bankName',
      label: 'Bank Name',
      visible: true,
      renderCell: (row) => row?.bankName || '-'
    },
    {
      key: 'accountNumber',
      label: 'Account Number',
      visible: true,
      renderCell: (row) => {
        const accountNumber = row?.accountNumber || ''
        return accountNumber ? `****${accountNumber.slice(-4)}` : '-'
      }
    },
    {
      key: 'accountHolderName',
      label: 'Account Holder',
      visible: true,
      renderCell: (row) => row?.accountHolderName || '-'
    },
    {
      key: 'branchName',
      label: 'Branch',
      visible: true,
      renderCell: (row) => row?.branchName || '-'
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      visible: true,
      renderCell: (row) => row?.ifscCode || '-'
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      renderCell: (row) => (
        <Chip
          label={row?.isActive ? 'Active' : 'Inactive'}
          color={row?.isActive ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      key: 'actions',
      label: '',
      visible: true,
      renderCell: (row) => {
        const menuOptions = [
          {
            text: 'View',
            icon: <Visibility fontSize="small" />,
            href: `/settings/bank-settings/view/${row._id}`,
            linkProps: {
              className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
            }
          },
          {
            text: 'Edit',
            icon: <Edit fontSize="small" />,
            href: `/settings/bank-settings/edit/${row._id}`,
            linkProps: {
              className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
            }
          },
          {
            text: 'Delete',
            icon: <Delete fontSize="small" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              disabled: deleting,
              onClick: () => handleDelete([row._id])
            }
          }
        ]

        return (
          <Box className="flex items-center justify-end">
            <OptionMenu
              icon={<MoreVert />}
              iconButtonProps={{ size: 'small', 'aria-label': 'bank actions' }}
              options={menuOptions}
            />
          </Box>
        )
      }
    }
  ]

  const handleDelete = async (ids) => {
    if (window.confirm('Are you sure you want to delete the selected bank account(s)?')) {
      await onDelete(ids)
      setSelectedRows([])
      onRefresh?.()
    }
  }

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      handleDelete(selectedRows)
    }
  }

  if (loading && banks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const filteredBanks = useMemo(() => {
    if (!searchTerm.trim()) return banks
    const lowered = searchTerm.toLowerCase()
    return banks.filter(bank =>
      bank?.bankName?.toLowerCase().includes(lowered) ||
      bank?.accountHolderName?.toLowerCase().includes(lowered) ||
      bank?.accountNumber?.toLowerCase().includes(lowered)
    )
  }, [banks, searchTerm])

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
          {error}
        </Alert>
      )}

      <CustomListTable
        columns={columns}
        rows={filteredBanks}
        pagination={pagination}
        loading={loading}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onBulkDelete={selectedRows.length > 0 ? handleBulkDelete : null}
        bulkDeleteLoading={deleting}
        emptyStateMessage="No bank accounts found. Add your first bank account to get started."
        rowKey={(row, index) => row?._id || row?.id || `bank-${index}`}
        showSearch
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search banks..."
        enableHover
      />
    </Box>
  )
}

export default BankSettingsList