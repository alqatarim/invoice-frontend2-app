import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from '@mui/material';
import DebitNoteHead from '@/views/debitNotes/listPurchaseReturn/debitNoteHead';
import CustomListTable from '@/components/custom-components/CustomListTable';

/**
 * SimpleDebitNoteList Component - matches purchase order list structure
 */
const SimpleDebitNoteList = ({
  debitNotes = [],
  loading = false,
  pagination = { current: 1, pageSize: 10, total: 0 },
  sortBy = '',
  sortDirection = 'asc',
  searchTerm = '',
  permissions,
  tableColumns = [],
  manageColumnsOpen = false,
  columnsState = [],
  onPageChange,
  onPageSizeChange,
  onSortRequest,
  onSearchChange,
  onView,
  onCloseManageColumns,
  onColumnCheckboxChange,
  onSaveColumns,
}) => {
     const tablePagination = useMemo(() => ({
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total
     }), [pagination]);

     return (
          <div className='flex flex-col gap-5'>
               <DebitNoteHead
                    debitNoteListData={debitNotes}
                    isLoading={loading}
               />

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              addRowButton={
                                   permissions?.canCreate && (
                                        <Button
                                             component={Link}
                                             href="/debitNotes/purchaseReturn-add"
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             New Debit Note
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={debitNotes}
                              loading={loading}
                              pagination={tablePagination}
                              onPageChange={onPageChange}
                              onRowsPerPageChange={onPageSizeChange}
                              onSort={onSortRequest}
                              sortBy={sortBy}
                              sortDirection={sortDirection}
                              noDataText="No debit notes found"
                              rowKey={(row) => row._id || row.id}
                              showSearch
                              searchValue={searchTerm}
                              onSearchChange={onSearchChange}
                              searchPlaceholder="Search debit notes..."
                              onRowClick={
                                   permissions?.canView
                                        ? (row) => onView(row._id)
                                        : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>

               <Dialog
                    open={manageColumnsOpen}
                    onClose={onCloseManageColumns}
                    maxWidth="sm"
                    fullWidth
               >
                    <DialogTitle>Manage Columns</DialogTitle>
                    <DialogContent>
                         <FormGroup>
                              {columnsState.map((column) => (
                                   <FormControlLabel
                                        key={column.key}
                                        control={
                                             <Checkbox
                                                  checked={column.visible}
                                                  onChange={(event) =>
                                                       onColumnCheckboxChange(column.key, event.target.checked)
                                                  }
                                             />
                                        }
                                        label={column.label}
                                   />
                              ))}
                         </FormGroup>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={onCloseManageColumns} color="secondary">
                              Cancel
                         </Button>
                         <Button onClick={onSaveColumns} color="primary" variant="contained">
                              Save
                         </Button>
                    </DialogActions>
               </Dialog>
          </div>
     );
};

export default SimpleDebitNoteList;