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
import OptionMenu from '@core/components/option-menu'

const TaxSettingsList = ({ 
  taxes = [], 
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
      key: 'name',
      label: 'Tax Name',
      visible: true,
      renderCell: (row) => row?.name || '-'
    },
    {
      key: 'taxRate',
      label: 'Tax Rate',
      visible: true,
      renderCell: (row) => row?.taxRate ? `${row.taxRate}%` : '-'
    },
    {
      key: 'type',
      label: 'Type',
      visible: true,
      renderCell: (row) => row?.type || '-'
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      renderCell: (row) => (
        <Chip
          label={row?.status ? 'Active' : 'Inactive'}
          color={row?.status ? 'success' : 'default'}
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
            href: `/settings/tax-settings/view/${row._id}`,
            linkProps: {
              className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
            }
          },
          {
            text: 'Edit',
            icon: <Edit fontSize="small" />,
            href: `/settings/tax-settings/edit/${row._id}`,
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
              iconButtonProps={{ size: 'small', 'aria-label': 'tax actions' }}
              options={menuOptions}
            />
          </Box>
        )
      }
    }
  ]

  const handleDelete = async (ids) => {
    if (window.confirm('Are you sure you want to delete the selected tax rate(s)?')) {
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

  if (loading && taxes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const filteredTaxes = useMemo(() => {
    if (!searchTerm.trim()) return taxes
    const lowered = searchTerm.toLowerCase()
    return taxes.filter(tax =>
      tax?.name?.toLowerCase().includes(lowered) ||
      tax?.type?.toLowerCase().includes(lowered)
    )
  }, [taxes, searchTerm])

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
          {error}
        </Alert>
      )}

      <CustomListTable
        columns={columns}
        rows={filteredTaxes}
        pagination={pagination}
        loading={loading}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onBulkDelete={selectedRows.length > 0 ? handleBulkDelete : null}
        bulkDeleteLoading={deleting}
        emptyStateMessage="No tax rates found. Add your first tax rate to get started."
        rowKey={(row, index) => row?._id || row?.id || `tax-${index}`}
        showSearch
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tax rates..."
        enableHover
      />
    </Box>
  )
}

export default TaxSettingsList