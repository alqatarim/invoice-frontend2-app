import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
     Card,
     Button,
     Snackbar,
     Alert,
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     FormControlLabel,
     Checkbox,
     FormGroup,
     Grid,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { useSearchParams } from 'next/navigation';

import DebitNoteHead from '@/views/debitNotes/listPurchaseReturn/debitNoteHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useDebitNoteListHandlers } from '@/handlers/debitNotes/useDebitNoteListHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { getDebitNoteColumns } from './debitNoteColumns';

/**
 * SimpleDebitNoteList Component - matches purchase order list structure
 */
const SimpleDebitNoteList = ({ initialDebitNotes, initialPagination, vendors = [] }) => {
     const theme = useTheme();
     const { data: session } = useSession();
     const searchParams = useSearchParams();

     // Permissions
     const permissions = {
          canCreate: usePermission('debitNote', 'create'),
          canUpdate: usePermission('debitNote', 'update'),
          canView: usePermission('debitNote', 'view'),
          canDelete: usePermission('debitNote', 'delete'),
     };

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success',
     });

     // Notification handlers
     const onError = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'error' });
     }, []);

     const onSuccess = React.useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'success' });
     }, []);

     // Initialize simplified handlers
     const handlers = useDebitNoteListHandlers({
          initialDebitNotes,
          initialPagination,
          onError,
          onSuccess,
     });

     // Column management
     const columns = useMemo(() => {
          if (!theme || !permissions) return [];
          return getDebitNoteColumns({ theme, permissions });
     }, [theme, permissions]);

     const [columnsState, setColumns] = useState(() => {
          if (typeof window !== 'undefined' && columns.length > 0) {
               const saved = localStorage.getItem('debitNoteVisibleColumns');
               if (saved) {
                    try {
                         const parsed = JSON.parse(saved);
                         return Array.isArray(parsed) ? parsed : columns;
                    } catch (e) {
                         console.warn('Failed to parse saved column preferences:', e);
                    }
               }
          }
          return columns;
     });

     const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

     React.useEffect(() => {
          if (columns.length > 0 && columnsState.length === 0) {
               setColumns(columns);
          }
     }, [columns, columnsState.length]);

     const handleColumnCheckboxChange = React.useCallback((columnKey, checked) => {
          setColumns(prev => prev.map(col =>
               col.key === columnKey ? { ...col, visible: checked } : col
          ));
     }, []);

     const handleSaveColumns = React.useCallback(() => {
          setManageColumnsOpen(false);
          if (typeof window !== 'undefined') {
               localStorage.setItem('debitNoteVisibleColumns', JSON.stringify(columnsState));
          }
     }, [columnsState]);

     // Table columns
     const tableColumns = useMemo(() => {
          const cellHandlers = {
               handleDelete: handlers.handleDelete,
               handleView: handlers.handleView,
               handleEdit: handlers.handleEdit,
               handleClone: handlers.handleClone,
               handleSend: handlers.handleSend,
               handlePrintDownload: handlers.handlePrintDownload,
               openConvertDialog: handlers.openConvertDialog,
               permissions,
               pagination: handlers.pagination,
          };

          return columnsState
               .filter(col => col.visible)
               .map(col => ({
                    ...col,
                    renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
               }));
     }, [columnsState, handlers, permissions]);

     const tablePagination = useMemo(() => ({
          page: handlers.pagination.current - 1,
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total
     }), [handlers.pagination]);

     return (
          <div className='flex flex-col gap-5'>
               <DebitNoteHead
                    debitNoteListData={handlers.debitNotes}
                    isLoading={handlers.loading}
               />

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              columns={tableColumns}
                              rows={handlers.debitNotes}
                              loading={handlers.loading}
                              pagination={tablePagination}
                              onPageChange={(page) => handlers.handlePageChange(page)}
                              onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
                              onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
                              sortBy={handlers.sortBy}
                              sortDirection={handlers.sortDirection}
                              noDataText="No debit notes found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={handlers.searchTerm || ''}
                              onSearchChange={handlers.handleSearchInputChange}
                              headerActions={
                                   permissions.canCreate && (
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
                         />
                    </Grid>
               </Grid>

               <Dialog
                    open={manageColumnsOpen}
                    onClose={() => setManageColumnsOpen(false)}
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
                                                  onChange={(e) => handleColumnCheckboxChange(column.key, e.target.checked)}
                                             />
                                        }
                                        label={column.label}
                                   />
                              ))}
                         </FormGroup>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => setManageColumnsOpen(false)} color="secondary">
                              Cancel
                         </Button>
                         <Button onClick={handleSaveColumns} color="primary" variant="contained">
                              Save
                         </Button>
                    </DialogActions>
               </Dialog>

               <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                    <Alert
                         onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                         severity={snackbar.severity}
                         variant="filled"
                         sx={{ width: '100%' }}
                    >
                         {snackbar.message}
                    </Alert>
               </Snackbar>

          </div>
     );
};

export default SimpleDebitNoteList;