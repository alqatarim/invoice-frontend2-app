'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButtonTwo';

import { useVendorLedgerHandler } from './handler';
import { getVendorLedgerColumns } from './ledgerColumns';

const hasPermission = (permissions = {}, action) => Boolean(permissions.canAll || permissions[action]);

const LedgerList = ({
  open,
  vendorId,
  permissions,
  onClose,
  onChanged,
  onError,
  onSuccess,
}) => {
  const {
    vendor,
    ledgerData,
    ledgerPagination,
    totalPages,
    isLoading,
    ledgerLoading,
    inlineRow,
    submittingLedger,
    handleLedgerPageChange,
    startAddRow,
    startEditRow,
    cancelInlineRow,
    updateInlineDraft,
    saveInlineRow,
    handleDeleteLedger,
  } = useVendorLedgerHandler({
    open,
    vendorId,
    onChanged,
    onError,
    onSuccess,
  });

  const canCreate = hasPermission(permissions, 'canCreate');
  const canUpdate = hasPermission(permissions, 'canUpdate');
  const canDelete = hasPermission(permissions, 'canDelete');
  const canView = hasPermission(permissions, 'canView');
  const isAddingRow = inlineRow?.mode === 'add';

  const columns = useMemo(
    () => getVendorLedgerColumns({
      canUpdate,
      canDelete,
      inlineRow,
      submittingLedger,
      startEditRow,
      cancelInlineRow,
      updateInlineDraft,
      saveInlineRow,
      handleDeleteLedger,
    }),
    [
      canUpdate,
      canDelete,
      inlineRow,
      submittingLedger,
      startEditRow,
      cancelInlineRow,
      updateInlineDraft,
      saveInlineRow,
      handleDeleteLedger,
    ]
  );

  const rows = useMemo(() => {
    const nextRows = [];

    if (isAddingRow) {
      nextRows.push({
        _id: inlineRow.entryId,
        __isInline: true,
        draft: inlineRow.draft,
        errors: inlineRow.errors,
      });
    }

    ledgerData.forEach(entry => {
      const isEditing = inlineRow?.mode === 'edit' && inlineRow.entryId === entry._id;

      nextRows.push(
        isEditing
          ? {
            ...entry,
            __isInline: true,
            draft: inlineRow.draft,
            errors: inlineRow.errors,
          }
          : entry
      );
    });

    return nextRows;
  }, [inlineRow, isAddingRow, ledgerData]);

  const addRowButton = canCreate ? (
    <CustomIconButton
      className="flex flex-row items-center justify-center gap-2 w-[7rem]"
      variant="outlined"
      skin="none"
      color="secondary"
      size="small"
      onClick={startAddRow}
      disabled={Boolean(inlineRow) || submittingLedger}
    >
      <Icon icon="mingcute:add-fill" width={16} />
      <Typography variant="button" color="secondary.main" fontSize={14}>
        Add Row
      </Typography>
    </CustomIconButton>
  ) : null;

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth="lg"
      scroll="body"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{
        sx: {
          mt: { xs: 4, sm: 6 },
          width: '100%',
          maxWidth: { xs: 'calc(100% - 24px)', sm: 1100 },
        },
      }}
    >
      <DialogTitle
        variant="h4"
        className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-12 sm:pbe-6 sm:pli-12"
      >
        Vendor Ledger
        {vendor?.vendor_name && (
          <Typography variant="body1" color="text.secondary">
            {vendor.vendor_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent className="overflow-visible pbs-0 pbe-6 pli-6 sm:pli-8">
        <IconButton onClick={onClose} className="absolute block-start-4 inline-end-4">
          <i className="ri-close-line text-textSecondary" />
        </IconButton>

        {/* <Box className="flex justify-between items-center gap-3 mb-4">
          <Typography variant="h6">Ledger Entries</Typography>
        </Box> */}

        {isLoading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            {/* <Typography className="ml-3">Loading vendor ledger...</Typography> */}
          </Box>
        ) : canView ? (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'visible', maxWidth: '100%' }}>
              <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    {columns.map(column => (
                      <TableCell
                        key={column.key}
                        align={column.align || 'left'}
                        sx={{ width: column.width }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length > 0 ? (
                    rows.map(row => (
                      <TableRow key={row._id} hover={!row.__isInline}>
                        {columns.map(column => (
                          <TableCell
                            key={column.key}
                            align={column.align || 'left'}
                            sx={{ width: column.width }}
                          >
                            {column.renderCell ? column.renderCell(row) : row[column.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <Box className="py-8">
                          <Typography color="textSecondary" className="mb-2">
                            No ledger entries found
                          </Typography>
                          {canCreate && (
                            <Typography variant="body2" color="textSecondary">
                              Click Add Row to create the first ledger entry
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {addRowButton && (
              <Box className="flex justify-start mt-3">
                {addRowButton}
              </Box>
            )}

            {/* {ledgerLoading && ledgerData.length > 0 && (
              <Box className="flex justify-center mt-4">
                <CircularProgress size={24} />
              </Box>
            )} */}

            {ledgerPagination.total > ledgerPagination.limit && (
              <Box className="flex justify-center mt-4">
                <Pagination count={totalPages} page={ledgerPagination.page} onChange={handleLedgerPageChange} />
              </Box>
            )}
          </>
        ) : (
          <Box className="py-8 text-center">
            <Typography color="error">You do not have permission to view ledger entries.</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="gap-2 justify-center pbs-0 pbe-8 pli-8 sm:pbe-8 sm:pli-12">
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LedgerList;
